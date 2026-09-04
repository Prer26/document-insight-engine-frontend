# Document Insight Engine

### PDF Question Answering with Highlighted Sources

A full-stack PDF Question Answering application that allows users to upload documents, ask questions about their contents, receive grounded answers, and directly view the supporting passages highlighted on the original PDF.

---

## 🚀 Live Demo

### Video 

**[Open Document Insight Engine](https://document-insight-engine-frontend.vercel.app/app)**

### Backend API

**[Open Backend API](https://document-insight-engine-backend-5.onrender.com)**

### API Documentation

**[Open Swagger Docs](https://document-insight-engine-backend-5.onrender.com/docs)**

---

## 🎥 Demo Video


**Demo flow:**

```text
Upload PDF
     ↓
Process Document
     ↓
Ask Question
     ↓
Retrieve Supporting Passages
     ↓
Generate Grounded Answer
     ↓
Display Source Citations
     ↓
Click Citation
     ↓
Navigate to Highlighted Text
```

---

## 📸 Screenshots

### 1. PDF Upload & Document Viewer

<img width="1917" height="882" alt="image" src="https://github.com/user-attachments/assets/32039896-e290-4167-910a-03ae68049697" />


---

### 2. Question & Answer

<img width="752" height="623" alt="image" src="https://github.com/user-attachments/assets/12fe2b25-bfa0-4487-84b9-ad7a3cebd9ee" />

---

### 3. Highlight
<img width="1718" height="375" alt="image" src="https://github.com/user-attachments/assets/db93d68b-7f34-4a0d-907b-2686fd720630" />


---

### 4. Citation Navigation

<img width="1905" height="870" alt="image" src="https://github.com/user-attachments/assets/d68111aa-05d5-4714-9209-c389ce01af96" />


---

### 5. Unsupported Question Handling

<img width="800" height="207" alt="image" src="https://github.com/user-attachments/assets/15aa4521-9f4a-4bee-88b5-011d307a9109" />


---

# 📌 Project Overview

Document Insight Engine is designed to answer questions directly from uploaded PDF documents while providing visual evidence for every answer.

Unlike a basic document chatbot, the system does not stop at generating an answer.

It also:

* identifies the supporting passage
* provides source citations
* preserves the original PDF coordinates
* highlights the supporting text directly on the PDF
* allows users to navigate from a citation to the corresponding highlight
* avoids generating unsupported answers

This makes the answer easier to verify against the original document.

---

# Key Features

* PDF upload
* Browser-based PDF viewing
* Semantic + keyword retrieval
* Grounded LLM question answering
* Word-level text positioning
* Direct PDF text highlighting
* Citation-to-highlight navigation
* Multiple supporting passages
* Unsupported-question detection
* PDF validation and error handling
* Support for 50+ page documents
* Deployed frontend and backend

---

# System Architecture

```text
                       ┌──────────────────────┐
                       │      Web Browser     │
                       │   React / TypeScript │
                       └──────────┬───────────┘
                                  │
                                  │ HTTP
                                  ▼
                       ┌──────────────────────┐
                       │    FastAPI Backend   │
                       └──────────┬───────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
       │ PDF         │     │ Chunking &  │     │ Retrieval   │
       │ Processing  │     │ Embeddings  │     │ & Ranking   │
       └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │       Groq LLM       │
                       │  Grounded Answering  │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ Sources + Coordinates│
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ PDF Highlight Layer  │
                       │ + Citation Navigation│
                       └──────────────────────┘
```

---

# How It Works

## 1. Upload PDF

The user uploads a PDF through the frontend.

The backend validates:

* file type
* file size
* empty files
* readable text layer
* PDF processing errors

The document is then processed using PyMuPDF.

---

## 2. Extract Text + Coordinates

The PDF is processed at word level.

Each extracted word retains its original PDF coordinates:

```text
text
x0
y0
x1
y1
```

These coordinates are important because they allow retrieved passages to later be mapped back to their exact visual position on the PDF.

---

## 3. Chunk the Document

The extracted document text is divided into overlapping chunks.

### Current configuration

```text
Chunk size: 180 words
Overlap:     60 words
```

The overlap helps preserve context when relevant information occurs near chunk boundaries.

Each chunk stores:

* page number
* text
* original words
* word coordinates
* embedding
* chunk ID

---

## 4. Generate Embeddings

The initial implementation used a transformer-based sentence embedding model.

During deployment, the transformer model created excessive memory usage in the constrained hosting environment.

Therefore, the embedding implementation was replaced with a lightweight deterministic hashing-based representation.

The system:

1. tokenizes text
2. hashes individual tokens
3. hashes token bigrams
4. builds a fixed-dimensional vector
5. normalizes the vector

This significantly reduces deployment memory requirements.

---

# 🔎 Retrieval

When a question is submitted, the query is converted into the same embedding representation.

The retriever combines three signals:

```text
Semantic Similarity
        +
Keyword Matching
        +
Requirement Boost
```

The final score is:

```text
Final Score =
    0.65 × Semantic Similarity
  + 0.25 × Keyword Score
  + 0.10 × Requirement Boost
```

The highest-ranked passages are selected as supporting sources.

---

# 🤖 Grounded Question Answering

The retrieved passages are sent to the Groq language model.

The model is instructed to:

* answer only using the retrieved document sources
* avoid inventing information
* cite supporting sources
* provide concise answers
* explicitly report when the document does not contain enough information

This keeps the generated response grounded in the uploaded document.

---

# Highlighting System

One of the main requirements of this project is that supporting text must be highlighted directly on the PDF.

The application therefore preserves the relationship:

```text
PDF Text
   ↓
Individual Words
   ↓
Word Coordinates
   ↓
Retrieved Passage
   ↓
Matching Words
   ↓
Highlight Rectangles
   ↓
PDF Overlay
```

For each word:

```text
x      = x0
y      = y0
width  = x1 - x0
height = y1 - y0
```

The resulting rectangles are displayed over the original PDF text.

---

# 🔗 Citation Navigation

Each supporting source contains:

* source ID
* page number
* source text
* retrieval score
* word information
* highlight coordinates

When a user clicks a citation, the application navigates to the relevant PDF page and highlights the supporting passage.

This allows the user to independently verify the answer.

---

# Unsupported Questions

The system is designed to avoid hallucinating answers.

If the document does not contain enough information to answer a question, the application reports this instead of:

* guessing
* generating unrelated information
* selecting a random source
* creating an unrelated highlight

Example:

```text
The document does not contain enough information to answer this question.
```

---

# Error Handling

The application handles:

### Invalid File

Non-PDF files are rejected.

### Oversized File

Files above the supported 50 MB limit are rejected.

### Empty File

Empty uploads are rejected.

### Scanned PDF

PDFs without a readable text layer are detected and rejected.

### Corrupted PDF

PDF processing errors are caught and returned as controlled API errors.

The goal is to prevent malformed documents from causing the application to crash.

---

# Evaluation

The application was evaluated using **10 questions across two PDF documents**.

### Documents

* 53-page PDF
* 27-page PDF

The evaluation measured two separate metrics:

| Metric                               |           Result |
| ------------------------------------ | ---------------: |
| Questions tested                     |           **10** |
| Correct supporting passage retrieved | **10/10 — 100%** |
| Correct highlight location           | **10/10 — 100%** |

All 10 evaluated questions retrieved the relevant supporting passage and correctly mapped the supporting text to its location on the PDF.

---

# Evaluation Questions

## Document 1

1. What topics are covered in Natural Language Processing?
2. What is word2vec?
3. What is the ROC AUC metric?
4. What are Long Short-Term Memory units?
5. What is transfer learning in NLP?

## Document 2

6. What advantages did vision provide during the Cambrian explosion?
7. What did Hubel and Wiesel discover about simple neurons?
8. What is the Neocognitron and why was it important?
9. What is LeNet-5 designed to recognize?
10. What is TensorFlow Playground used for?

Each question was manually checked for:

```text
Retrieval Accuracy
        +
Highlight Accuracy
```

---

# Challenges & Solutions

## Deployment Memory

### Problem

The initial transformer embedding model exceeded the memory available in the deployment environment.

### Solution

Replaced the transformer embedding implementation with a lightweight deterministic hashing-based embedding approach.

---

## Cross-Origin Requests

### Problem

The frontend and backend are hosted on different domains.

### Solution

Configured FastAPI CORS to allow the production Vercel frontend along with local development origins.

---

## PDF Text Highlighting

### Problem

Page-number-only citations were insufficient because the requirement was to highlight the actual supporting text.

### Solution

Preserved word-level PDF coordinates during extraction and converted the coordinates into highlight rectangles in the frontend.

---

## Unsupported Answers

### Problem

A language model may generate an answer even when the document does not contain sufficient evidence.

### Solution

The LLM is instructed to remain grounded in retrieved sources, while the backend detects unsupported responses and avoids displaying unrelated sources/highlights.

---

# Limitations

The coordinate-based highlighting approach works best for PDFs with a normal selectable text layer.

Potential challenges include:

* scanned PDFs
* complex multi-column layouts
* unusual reading order
* tables
* rotated text
* heavily formatted documents
* transformed text
* text split across unusual regions

Scanned PDFs without a readable text layer are rejected rather than producing unreliable highlights.

---

# Future Improvements

* True token-level streaming using Server-Sent Events
* OCR support for scanned PDFs
* Stronger semantic embedding models
* Improved multi-column layout handling
* Better table handling
* Improved passage ranking
* Improved multi-line highlight grouping
* Persistent object storage
* Document deletion and management
* Larger automated evaluation datasets

---

# Project Structure

```text
Document Insight Engine/
│
├── backend/
│   ├── main.py
│   ├── chunker.py
│   ├── document_store.py
│   ├── embeddings.py
│   ├── highlight.py
│   ├── llm.py
│   ├── pdf_processor.py
│   ├── retriever.py
│   ├── requirements.txt
│   ├── documents/
│   └── uploads/
│
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    ├── vite.config.ts
    └── ...
```

---

# Running Locally

## Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL provided by Vite.

---

# Deployment

| Component      | Platform |
| -------------- | -------- |
| Frontend       | Vercel   |
| Backend        | Render   |
| LLM            | Groq     |
| PDF Processing | PyMuPDF  |

### Production Frontend

https://document-insight-engine-frontend.vercel.app/app

### Production Backend

https://document-insight-engine-backend-5.onrender.com

### API Documentation

https://document-insight-engine-backend-5.onrender.com/docs

---

# 📄 Project Report

A detailed implementation and evaluation report is available here:

**[Download / View Q1 Project Report](./Document_Insight_Engine_Q1_Report.pdf)**

The report includes:

* implementation approach
* evaluation results
* text-to-position mapping
* difficult layout considerations
* challenges and solutions
* deployment details
* future improvements
* assignment requirement coverage

---

# Security Note

API keys and other secrets should be stored in environment variables and must not be committed to the repository.

For local development:

```env
GROQ_API_KEY=your_groq_api_key
```

---

# Project

**Document Insight Engine**

Full-stack PDF Question Answering system with grounded retrieval and visual source highlighting.

**Frontend:**
https://github.com/Prer26/document-insight-engine-frontend

**Backend:**
https://github.com/Prer26/document-insight-engine-backend
