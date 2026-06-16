from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Response, UploadFile, status
from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.complaint import Complaint
from app.models.user import User
from app.schemas.complaint import ComplaintListResponse, ComplaintRead, ComplaintUpdate
from app.services.complaints import to_list_item
from app.services.file_storage import save_evidence_file
from app.services.inference import get_inference_service


router = APIRouter()

VALID_STATUSES = {"Pending", "In Progress", "Resolved"}
VALID_URGENCIES = {"Low", "Medium", "High"}


@router.post("", response_model=ComplaintRead, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    is_anonymous: bool = Form(False),
    first_name: str | None = Form(None),
    last_name: str | None = Form(None),
    email: str | None = Form(None),
    company_name: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    evidence: UploadFile | None = File(None),
    db: Session = Depends(get_db),
) -> Complaint:
    cleaned_description = description.strip()
    if len(cleaned_description.split()) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Description must contain at least 3 words.",
        )

    stored_file = await save_evidence_file(evidence)
    prediction = get_inference_service().predict(cleaned_description, category=category)

    complaint = Complaint(
        is_anonymous=is_anonymous,
        first_name=None if is_anonymous else _blank_to_none(first_name),
        last_name=None if is_anonymous else _blank_to_none(last_name),
        email=None if is_anonymous else _blank_to_none(email),
        company_name=company_name.strip(),
        category=category.strip(),
        description=cleaned_description,
        evidence_filename=stored_file.filename if stored_file else None,
        evidence_content_type=stored_file.content_type if stored_file else None,
        evidence_path=stored_file.path if stored_file else None,
        urgency=prediction.urgency,
        sentiment=prediction.sentiment,
        predicted_category=prediction.predicted_category,
        confidence=prediction.confidence,
        inference_provider=prediction.provider,
        inference_version=prediction.version,
        inference_latency_ms=prediction.latency_ms,
    )
    db.add(complaint)
    db.flush()
    complaint.public_id = f"CMP-{complaint.id:06d}"
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("", response_model=ComplaintListResponse)
def list_complaints(
    search: str | None = Query(None),
    urgency: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> ComplaintListResponse:
    filters = []
    if search:
        q = f"%{search.strip()}%"
        filters.append(
            or_(
                Complaint.public_id.ilike(q),
                Complaint.first_name.ilike(q),
                Complaint.last_name.ilike(q),
                Complaint.email.ilike(q),
                Complaint.company_name.ilike(q),
                Complaint.category.ilike(q),
                Complaint.predicted_category.ilike(q),
            )
        )
    if urgency and urgency != "All":
        filters.append(Complaint.urgency == urgency)
    if status_filter and status_filter != "All":
        filters.append(Complaint.status == status_filter)

    total = db.scalar(select(func.count(Complaint.id)).where(*filters)) or 0
    complaints = db.scalars(
        select(Complaint)
        .where(*filters)
        .order_by(desc(Complaint.created_at))
        .offset(skip)
        .limit(limit)
    ).all()
    return ComplaintListResponse(
        items=[to_list_item(complaint) for complaint in complaints],
        total=total,
    )


@router.get("/export.csv")
def export_complaints(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Response:
    complaints = db.scalars(select(Complaint).order_by(desc(Complaint.created_at))).all()
    header = [
        "id",
        "created_at",
        "company_name",
        "category",
        "predicted_category",
        "urgency",
        "sentiment",
        "status",
        "is_anonymous",
        "email",
    ]
    rows = [",".join(header)]
    for complaint in complaints:
        rows.append(
            ",".join(
                _csv_cell(value)
                for value in [
                    complaint.public_id,
                    complaint.created_at.isoformat(),
                    complaint.company_name,
                    complaint.category,
                    complaint.predicted_category,
                    complaint.urgency,
                    complaint.sentiment,
                    complaint.status,
                    str(complaint.is_anonymous),
                    complaint.email or "",
                ]
            )
        )
    return Response(
        content="\n".join(rows),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=lentera-complaints.csv"},
    )


@router.get("/{public_id}", response_model=ComplaintRead)
def get_complaint(
    public_id: str,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Complaint:
    return _get_complaint_or_404(db, public_id)


@router.patch("/{public_id}", response_model=ComplaintRead)
def update_complaint(
    public_id: str,
    payload: ComplaintUpdate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Complaint:
    complaint = _get_complaint_or_404(db, public_id)
    if payload.status is not None:
        if payload.status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid complaint status.",
            )
        complaint.status = payload.status
        complaint.resolved_at = datetime.now(timezone.utc) if payload.status == "Resolved" else None
    if payload.resolution_notes is not None:
        complaint.resolution_notes = payload.resolution_notes.strip() or None

    db.commit()
    db.refresh(complaint)
    return complaint


def _get_complaint_or_404(db: Session, public_id: str) -> Complaint:
    complaint = db.scalar(select(Complaint).where(Complaint.public_id == public_id))
    if complaint is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found.")
    return complaint


def _blank_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _csv_cell(value: object) -> str:
    text = "" if value is None else str(value)
    escaped = text.replace('"', '""')
    return f'"{escaped}"'
