"""
카테고리별 이미지 다운로드 스크립트
실행: python download_images.py
"""
import os
import urllib.request

CATEGORIES = {
    "동물": [
        ("https://picsum.photos/seed/ani1/800/600", "ani1.jpg"),
        ("https://picsum.photos/seed/ani2/800/600", "ani2.jpg"),
        ("https://picsum.photos/seed/ani3/800/600", "ani3.jpg"),
        ("https://picsum.photos/seed/ani4/800/600", "ani4.jpg"),
        ("https://picsum.photos/seed/ani5/800/600", "ani5.jpg"),
    ],
    "자연": [
        ("https://picsum.photos/seed/nat1/800/600", "nat1.jpg"),
        ("https://picsum.photos/seed/nat2/800/600", "nat2.jpg"),
        ("https://picsum.photos/seed/nat3/800/600", "nat3.jpg"),
        ("https://picsum.photos/seed/nat4/800/600", "nat4.jpg"),
        ("https://picsum.photos/seed/nat5/800/600", "nat5.jpg"),
    ],
    "풍경": [
        ("https://picsum.photos/seed/sce1/800/600", "sce1.jpg"),
        ("https://picsum.photos/seed/sce2/800/600", "sce2.jpg"),
        ("https://picsum.photos/seed/sce3/800/600", "sce3.jpg"),
        ("https://picsum.photos/seed/sce4/800/600", "sce4.jpg"),
        ("https://picsum.photos/seed/sce5/800/600", "sce5.jpg"),
    ],
    "요리": [
        ("https://picsum.photos/seed/cook1/800/600", "cook1.jpg"),
        ("https://picsum.photos/seed/cook2/800/600", "cook2.jpg"),
        ("https://picsum.photos/seed/cook3/800/600", "cook3.jpg"),
        ("https://picsum.photos/seed/cook4/800/600", "cook4.jpg"),
        ("https://picsum.photos/seed/cook5/800/600", "cook5.jpg"),
    ],
}

BASE_DIR = os.path.join("static", "images")


def download():
    for category, items in CATEGORIES.items():
        folder = os.path.join(BASE_DIR, category)
        os.makedirs(folder, exist_ok=True)
        for url, filename in items:
            dest = os.path.join(folder, filename)
            if os.path.exists(dest):
                print(f"  skip (already exists): {dest}")
                continue
            print(f"  downloading {category}/{filename} ...", end=" ", flush=True)
            urllib.request.urlretrieve(url, dest)
            print("done")
    print("\n이미지 다운로드 완료!")


if __name__ == "__main__":
    download()
