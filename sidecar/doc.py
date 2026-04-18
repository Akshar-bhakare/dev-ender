import cv2
import numpy as np
import easyocr

# Use OpenCV's built-in Haar cascade for face detection in documents
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# EasyOCR reader — initialized once
reader = None


def _get_reader():
    global reader
    if reader is None:
        reader = easyocr.Reader(['en'], gpu=False)
    return reader


def _detect_face(img_bgr: np.ndarray):
    """Detect face and return the largest bounding box or None."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(40, 40))
    if len(faces) == 0:
        return None
    return max(faces, key=lambda f: f[2] * f[3])


def _face_embedding(img_bgr: np.ndarray, bbox) -> np.ndarray:
    """512-d pseudo-embedding from face crop pixel statistics."""
    x, y, w, h = bbox
    pad = int(min(w, h) * 0.1)
    x1, y1 = max(0, x - pad), max(0, y - pad)
    x2, y2 = min(img_bgr.shape[1], x + w + pad), min(img_bgr.shape[0], y + h + pad)
    face_crop = img_bgr[y1:y2, x1:x2]

    face_small = cv2.resize(face_crop, (32, 32))
    gray_face = cv2.cvtColor(face_small, cv2.COLOR_BGR2GRAY).astype(np.float32)
    flat = gray_face.flatten() / 255.0  # 1024, take first 416

    hist_parts = []
    for c in range(3):
        h, _ = np.histogram(face_crop[:, :, c], bins=32, range=(0, 256), density=True)
        hist_parts.append(h)
    hist_vec = np.concatenate(hist_parts)  # 96-d

    combined = np.concatenate([flat[:416], hist_vec])  # 512-d
    norm = np.linalg.norm(combined)
    return combined / norm if norm > 0 else combined


def process_document(image_bytes: bytes) -> tuple:
    """
    Returns (embedding: list[float] | None, ocr_data: dict, face_found: bool)
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None, {}, False

    # Face detection in document image
    bbox = _detect_face(img)
    embedding = None
    face_found = False
    if bbox is not None:
        embedding = _face_embedding(img, bbox).tolist()
        face_found = True

    # OCR
    ocr_data = {"name": "", "dob": "", "doc_number": "", "expiry": ""}
    try:
        r = _get_reader()
        results = r.readtext(img)
        lines = [res[1] for res in results]
        full_text = " ".join(lines).upper()

        for i, line in enumerate(lines):
            u = line.upper()
            if any(kw in u for kw in ["NAME", "FULL NAME"]) and i + 1 < len(lines):
                ocr_data["name"] = lines[i + 1]
            elif any(kw in u for kw in ["DOB", "DATE OF BIRTH", "BIRTH"]) and i + 1 < len(lines):
                ocr_data["dob"] = lines[i + 1]
            elif any(kw in u for kw in ["DOC", "NUMBER", "ID NO", "PASSPORT"]):
                part = u.split(":")[-1].strip()
                if part:
                    ocr_data["doc_number"] = part

        # Fallback: use first non-empty line as name
        if not ocr_data["name"] and lines:
            ocr_data["name"] = lines[0]

    except Exception as e:
        print(f"OCR error: {e}")

    return embedding, ocr_data, face_found
