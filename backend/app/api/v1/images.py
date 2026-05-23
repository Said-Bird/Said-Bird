import os
import random

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from app.core.config import settings

router = APIRouter()

IMAGES_DIR = os.path.join("static", "images")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def _list_images(category: str) -> list[str]:
    folder = os.path.join(IMAGES_DIR, category)
    if not os.path.isdir(folder):
        return []
    return [
        f for f in os.listdir(folder)
        if os.path.splitext(f)[1].lower() in ALLOWED_EXTENSIONS
    ]


@router.get("/categories")
def get_categories():
    if not os.path.isdir(IMAGES_DIR):
        return {"categories": []}
    categories = [
        d for d in os.listdir(IMAGES_DIR)
        if os.path.isdir(os.path.join(IMAGES_DIR, d))
    ]
    return {"categories": categories}


@router.get("/random")
def get_random_image(category: str = Query(..., description="이미지 카테고리 (예: 동물, 자연, 풍경)")):
    files = _list_images(category)
    if not files:
        raise HTTPException(status_code=404, detail=f"카테고리 '{category}'에 이미지가 없습니다.")

    filename = random.choice(files)
    base_url = settings.BASE_URL.rstrip("/")
    url = f"{base_url}/static/images/{category}/{filename}"
    image_id = f"{category}_{filename}"

    return {"image_id": image_id, "url": url, "category": category}
