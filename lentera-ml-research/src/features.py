import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

def split_data(df: pd.DataFrame, text_col: str, target_col: str, random_state=42):
    df_train_val, df_test = train_test_split(
        df, 
        test_size=0.15, 
        random_state=random_state, 
        stratify=df[target_col]
    )
    
    val_relative_size = 0.15 / 0.85
    df_train, df_val = train_test_split(
        df_train_val, 
        test_size=val_relative_size, 
        random_state=random_state, 
        stratify=df_train_val[target_col]
    )
    
    print(f"Train size: {len(df_train)}, Val size: {len(df_val)}, Test size: {len(df_test)}")
    return df_train, df_val, df_test

def extract_tfidf(train_texts, val_texts, test_texts, max_features=5000):
    vectorizer = TfidfVectorizer(max_features=max_features, stop_words='english', ngram_range=(1,3))
    
    X_train = vectorizer.fit_transform(train_texts)
    X_val = vectorizer.transform(val_texts)
    X_test = vectorizer.transform(test_texts)
    
    return X_train, X_val, X_test, vectorizer

def extract_lstm_sequences(train_texts, val_texts, test_texts, max_words=10000, max_len=150):
    tokenizer = Tokenizer(num_words=max_words, oov_token="<OOV>")
    tokenizer.fit_on_texts(train_texts)
    
    train_seq = tokenizer.texts_to_sequences(train_texts)
    val_seq = tokenizer.texts_to_sequences(val_texts)
    test_seq = tokenizer.texts_to_sequences(test_texts)
    
    X_train_pad = pad_sequences(train_seq, maxlen=max_len, padding='post', truncating='post')
    X_val_pad = pad_sequences(val_seq, maxlen=max_len, padding='post', truncating='post')
    X_test_pad = pad_sequences(test_seq, maxlen=max_len, padding='post', truncating='post')
    
    return X_train_pad, X_val_pad, X_test_pad, tokenizer
