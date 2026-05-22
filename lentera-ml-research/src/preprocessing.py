import pandas as pd
import numpy as np
import spacy
from src.constants import WORDS_TO_KEEP
from .constants import HIGH_ISSUES, HIGH_KEYWORDS, MEDIUM_ISSUES, MEDIUM_KEYWORDS, WORDS_TO_KEEP

def apply_urgency_labels(df: pd.DataFrame) -> pd.DataFrame:
    high_pattern = '|'.join([rf"\b{kw}\b" for kw in HIGH_KEYWORDS])
    medium_pattern = '|'.join([rf"\b{kw}\b" for kw in MEDIUM_KEYWORDS])

    # Cek label
    is_high_issue = df['Issue'].isin(HIGH_ISSUES)
    is_medium_issue = df['Issue'].isin(MEDIUM_ISSUES)

    # cek keyword dalam narasi
    narrative_lower = df['Consumer complaint narrative'].fillna('').str.lower()
    has_high_keyword = narrative_lower.str.contains(high_pattern, regex=True)
    has_medium_keyword = narrative_lower.str.contains(medium_pattern, regex=True)

    # gabungkan kondisi untuk menentukan urgency
    conditions = [
        is_high_issue | has_high_keyword,
        is_medium_issue | has_medium_keyword
    ]

    choices = ['High', 'Medium']
    df['Urgency'] = np.select(conditions, choices, default='Low')
    
    return df

def filter_invalid_complaints(df: pd.DataFrame) -> pd.DataFrame:
    # 1. Menyalin kerangka data untuk menghindari modifikasi referensi asli (SettingWithCopyWarning)
    df_clean = df.copy()
    
    # 2. Menghapus baris yang nilai narasinya kosong (NaN)
    df_clean = df_clean.dropna(subset=['Consumer complaint narrative'])
    
    # 3. Menghitung jumlah kata secara tervektorisasi (Vectorized Word Count)
    # Menghapus karakter non-alfanumerik secara temporer murni untuk akurasi perhitungan kata
    word_counts = (
        df_clean['Consumer complaint narrative']
        .str.replace(r'[^a-zA-Z0-9\s]', '', regex=True)
        .str.split()
        .str.len()
    )
    df_clean['Word Count'] = word_counts

    # 4. Menyaring dan mempertahankan baris yang memiliki 3 kata atau lebih
    df_clean = df_clean[word_counts >= 3]
    
    # Opsional: Mereset indeks kerangka data agar berurutan kembali setelah ada baris yang dihapus
    df_clean = df_clean.reset_index(drop=True)
    
    return df_clean

# 1. Inisialisasi model spaCy (Hanya memuat Tokenizer dan Lemmatizer untuk kecepatan)
nlp = spacy.load("en_core_web_sm", disable=['parser', 'ner'])

# 2. Modifikasi konfigurasi stopwords bawaan spaCy sesuai konstanta
for word in WORDS_TO_KEEP:
    nlp.vocab[word].is_stop = False

def normalize_text_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    df_clean = df.copy()
    
    # Data untuk kebutuhan transformer 
    # Mengisi nilai kosong dan mengubah ke huruf kecil
    raw_texts = df_clean['Consumer complaint narrative'].fillna('').str.lower()
    
    # Menghapus karakter pelindung privasi CFPB (seperti 'xxxx' atau 'xx/xx')
    raw_texts = raw_texts.str.replace(r'x{2,}', '', regex=True)
    raw_texts = raw_texts.str.replace(r'\s+', ' ', regex=True).str.strip()
    
    # Menyimpan sebagai kolom khusus Transformer (Tanda baca utuh untuk Self-Attention)
    df_clean['Raw_Filtered_Narrative'] = raw_texts

    # Data untuk kebutuhan klasik
    # Mengambil teks dari kolom yang sudah difilter
    cleaned_texts = raw_texts.copy()
    
    # Menghapus apostrof secara presisi untuk menghindari pemecahan kata (misal: "don't" -> "dont")
    cleaned_texts = cleaned_texts.str.replace(r"'", "", regex=True)
    
    # Pembersihan Ekstrem: Menghapus seluruh karakter selain huruf abjad dan spasi (termasuk angka)
    cleaned_texts = cleaned_texts.str.replace(r'[^a-z\s]', ' ', regex=True)
    
    # Normalisasi spasi ganda
    cleaned_texts = cleaned_texts.str.replace(r'\s+', ' ', regex=True).str.strip()
    
    # Pemrosesan tingkat lanjut menggunakan spaCy batch processing (nlp.pipe)
    processed_narratives = []
    
    # Mengonversi Pandas Series menjadi Python List murni agar spaCy memprosesnya lebih aman
    texts_to_process = cleaned_texts.astype(str).tolist()

    # nlp.pipe memproses teks dalam potongan-potongan (batch) sehingga alokasi memori sangat efisien
    for doc in nlp.pipe(texts_to_process, batch_size=1000):
        # Menyaring token yang bukan stopwords dan mengubahnya menjadi lemma (kata dasar)
        tokens = [
            token.lemma_ for token in doc 
            if not token.is_stop                 # Filter Stopwords umum
            and token.text.strip() != ""         # Filter token kosong
            and len(token.text) > 1              # Filter noise karakter tunggal (seperti 'u', 's', 'c')
        ]
        processed_narratives.append(" ".join(tokens))
        
    # Menyimpan hasil akhir ke dalam kerangka data
    df_clean['Cleaned_Narrative'] = processed_narratives
    
    return df_clean