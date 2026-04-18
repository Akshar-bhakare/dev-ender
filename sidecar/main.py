from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from face import process_face_frames
from doc import process_document

app = FastAPI(title="KaaMe Face Sidecar", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/embed")
async def embed_faces(files: List[UploadFile] = File(...)):
    """Accept 1-5 face frame images, return 512-d embedding + liveness flag."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    frame_bytes_list = []
    for f in files:
        content = await f.read()
        frame_bytes_list.append(content)

    embedding, liveness_ok = process_face_frames(frame_bytes_list)

    if embedding is None:
        raise HTTPException(status_code=400, detail="No face detected in any of the provided frames")

    return {
        "embedding": embedding,
        "liveness_ok": liveness_ok
    }


@app.post("/embed-doc")
async def embed_doc(file: UploadFile = File(...)):
    """Accept an ID/Passport image, extract face embedding + OCR text."""
    content = await file.read()
    embedding, ocr_data, face_found = process_document(content)

    return {
        "embedding": embedding,
        "ocr": ocr_data,
        "face_found": face_found
    }


class CompareRequest(BaseModel):
    embedding_a: List[float]
    embedding_b: List[float]


@app.post("/compare")
def compare_embeddings(req: CompareRequest):
    """Cosine similarity between two 512-d embeddings."""
    a = np.array(req.embedding_a)
    b = np.array(req.embedding_b)
    norm_a, norm_b = np.linalg.norm(a), np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return {"similarity": 0.0}
    similarity = float(np.dot(a, b) / (norm_a * norm_b))
    return {"similarity": similarity}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
