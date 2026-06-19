import pandas as pd
import numpy as np
import spacy
from src.constants import WORDS_TO_KEEP
from .constants import HIGH_ISSUES, HIGH_KEYWORDS, MEDIUM_ISSUES, MEDIUM_KEYWORDS, WORDS_TO_KEEP

def apply_urgency_labels(df: pd.DataFrame) -> pd.DataFrame:
    high_pattern = '|'.join([rf"\b{kw}\b" for kw in HIGH_KEYWORDS])
    medium_pattern = '|'.join([rf"\b{kw}\b" for kw in MEDIUM_KEYWORDS])

    is_high_issue = df['Issue'].isin(HIGH_ISSUES)
    is_medium_issue = df['Issue'].isin(MEDIUM_ISSUES)

    narrative_lower = df['Consumer complaint narrative'].fillna('').str.lower()
    has_high_keyword = narrative_lower.str.contains(high_pattern, regex=True)
    has_medium_keyword = narrative_lower.str.contains(medium_pattern, regex=True)

    conditions = [
        is_high_issue | has_high_keyword,
        is_medium_issue | has_medium_keyword
    ]

    choices = ['High', 'Medium']
    df['Urgency'] = np.select(conditions, choices, default='Low')
    
    return df

def filter_invalid_complaints(df: pd.DataFrame) -> pd.DataFrame:
    df_clean = df.copy()
    
    df_clean = df_clean.dropna(subset=['Consumer complaint narrative'])
    
    word_counts = (
        df_clean['Consumer complaint narrative']
        .str.replace(r'[^a-zA-Z0-9\s]', '', regex=True)
        .str.split()
        .str.len()
    )
    df_clean['Word Count'] = word_counts

    df_clean = df_clean[word_counts >= 3]
    
    df_clean = df_clean.reset_index(drop=True)
    
    return df_clean

nlp = spacy.load("en_core_web_sm", disable=['parser', 'ner'])

for word in WORDS_TO_KEEP:
    nlp.vocab[word].is_stop = False

def normalize_text_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    df_clean = df.copy()
    
    raw_texts = df_clean['Consumer complaint narrative'].fillna('').str.lower()
    
    raw_texts = raw_texts.str.replace(r'\{\$\d+(?:\.\d+)?\}', ' moneyamount ', regex=True)
    raw_texts = raw_texts.str.replace(r'\bx{2,}/x{2,}(?:/x{2,})?\b', ' datemask ', regex=True)
    raw_texts = raw_texts.str.replace(r'\bx{2,}\b', '', regex=True)
    
    raw_texts = raw_texts.str.replace(r'\s+', ' ', regex=True).str.strip()
    
    df_clean['Raw_Filtered_Narrative'] = raw_texts

    cleaned_texts = raw_texts.copy()
    
    cleaned_texts = cleaned_texts.str.replace(r"n't\b", " not", regex=True)
    cleaned_texts = cleaned_texts.str.replace(r"cannot\b", "can not", regex=True)
    
    cleaned_texts = cleaned_texts.str.replace(r"'", "", regex=True)
    
    cleaned_texts = cleaned_texts.str.replace(r'[^a-z\s]', ' ', regex=True)
    
    cleaned_texts = cleaned_texts.str.replace(r'\s+', ' ', regex=True).str.strip()
    
    processed_narratives = []
    
    texts_to_process = cleaned_texts.astype(str).tolist()

    for doc in nlp.pipe(texts_to_process, batch_size=1000):
        tokens = [
            token.lemma_ for token in doc 
            if not token.is_stop
            and token.text.strip() != ""
            and len(token.text) > 1
        ]
        processed_narratives.append(" ".join(tokens))
        
    df_clean['Cleaned_Narrative'] = processed_narratives
    
    return df_clean
