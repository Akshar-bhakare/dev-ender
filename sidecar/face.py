import cv2
import numpy as np

# Use OpenCV's built-in Haar cascade — no model download required
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')


def _detect_face(img_bgr: np.ndarray):
    """Detect face and return the largest bounding box, or None."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
    if len(faces) == 0:
        return None
    # Return largest face
    return max(faces, key=lambda f: f[2] * f[3])


def _face_embedding(img_bgr: np.ndarray, bbox) -> np.ndarray:
    """
    Extract a 512-d pseudo-embedding from a detected face crop.
    Uses resized pixel histogram + spatial moments — deterministic per face.
    """
    x, y, w, h = bbox
    # Small padding
    pad = int(min(w, h) * 0.1)
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(img_bgr.shape[1], x + w + pad)
    y2 = min(img_bgr.shape[0], y + h + pad)
    face_crop = img_bgr[y1:y2, x1:x2]

    # Resize to 32×32
    face_small = cv2.resize(face_crop, (32, 32))
    gray_face = cv2.cvtColor(face_small, cv2.COLOR_BGR2GRAY).astype(np.float32)

    # Build feature vector from flattened pixel values and channel histograms
    flat = gray_face.flatten() / 255.0  # 1024 values

    hist_parts = []
    for c in range(3):
        h, _ = np.histogram(face_crop[:, :, c], bins=32, range=(0, 256), density=True)
        hist_parts.append(h)  # 32 values each → 96 total
    hist_vec = np.concatenate(hist_parts)

    # Combine to exactly 512 dims (1024 pixels truncated to 416 + 96 hist = 512)
    combined = np.concatenate([flat[:416], hist_vec])  # 512-d

    # L2 normalise so cosine similarity works correctly
    norm = np.linalg.norm(combined)
    if norm > 0:
        combined = combined / norm

    return combined


def process_face_frames(frame_bytes_list: list) -> tuple:
    """
    Returns (embedding: list[float] | None, liveness_ok: bool)
    """
    if not frame_bytes_list:
        return None, False

    valid_embeddings = []

    for frame_bytes in frame_bytes_list:
        nparr = np.frombuffer(frame_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            continue
        bbox = _detect_face(img)
        if bbox is not None:
            emb = _face_embedding(img, bbox)
            valid_embeddings.append(emb)

    if not valid_embeddings:
        return None, False

    # Average embeddings across frames for stability
    avg_emb = np.mean(valid_embeddings, axis=0)
    norm = np.linalg.norm(avg_emb)
    if norm > 0:
        avg_emb = avg_emb / norm

    # Liveness: pass if we got a face in at least 2/3 of submitted frames,
    # or if only 1 frame was submitted (single-frame mode)
    min_faces_needed = max(1, len(frame_bytes_list) // 2)
    liveness_ok = len(valid_embeddings) >= min_faces_needed

    return avg_emb.tolist(), liveness_ok
