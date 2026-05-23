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
    "음악": [
        ("https://picsum.photos/seed/mus1/800/600", "mus1.jpg"),
        ("https://picsum.photos/seed/mus2/800/600", "mus2.jpg"),
        ("https://picsum.photos/seed/mus3/800/600", "mus3.jpg"),
        ("https://picsum.photos/seed/mus4/800/600", "mus4.jpg"),
        ("https://picsum.photos/seed/mus5/800/600", "mus5.jpg"),
    ],
    "여행": [
        ("https://picsum.photos/seed/trv1/800/600", "trv1.jpg"),
        ("https://picsum.photos/seed/trv2/800/600", "trv2.jpg"),
        ("https://picsum.photos/seed/trv3/800/600", "trv3.jpg"),
        ("https://picsum.photos/seed/trv4/800/600", "trv4.jpg"),
        ("https://picsum.photos/seed/trv5/800/600", "trv5.jpg"),
    ],
    "운동": [
        ("https://picsum.photos/seed/spt1/800/600", "spt1.jpg"),
        ("https://picsum.photos/seed/spt2/800/600", "spt2.jpg"),
        ("https://picsum.photos/seed/spt3/800/600", "spt3.jpg"),
        ("https://picsum.photos/seed/spt4/800/600", "spt4.jpg"),
        ("https://picsum.photos/seed/spt5/800/600", "spt5.jpg"),
    ],
    "독서": [
        ("https://picsum.photos/seed/bk1/800/600", "bk1.jpg"),
        ("https://picsum.photos/seed/bk2/800/600", "bk2.jpg"),
        ("https://picsum.photos/seed/bk3/800/600", "bk3.jpg"),
        ("https://picsum.photos/seed/bk4/800/600", "bk4.jpg"),
        ("https://picsum.photos/seed/bk5/800/600", "bk5.jpg"),
    ],
    "그림": [
        ("https://picsum.photos/seed/art1/800/600", "art1.jpg"),
        ("https://picsum.photos/seed/art2/800/600", "art2.jpg"),
        ("https://picsum.photos/seed/art3/800/600", "art3.jpg"),
        ("https://picsum.photos/seed/art4/800/600", "art4.jpg"),
        ("https://picsum.photos/seed/art5/800/600", "art5.jpg"),
    ],
    "가족": [
        ("https://picsum.photos/seed/fam1/800/600", "fam1.jpg"),
        ("https://picsum.photos/seed/fam2/800/600", "fam2.jpg"),
        ("https://picsum.photos/seed/fam3/800/600", "fam3.jpg"),
        ("https://picsum.photos/seed/fam4/800/600", "fam4.jpg"),
        ("https://picsum.photos/seed/fam5/800/600", "fam5.jpg"),
    ],
    "영화": [
        ("https://picsum.photos/seed/mov1/800/600", "mov1.jpg"),
        ("https://picsum.photos/seed/mov2/800/600", "mov2.jpg"),
        ("https://picsum.photos/seed/mov3/800/600", "mov3.jpg"),
        ("https://picsum.photos/seed/mov4/800/600", "mov4.jpg"),
        ("https://picsum.photos/seed/mov5/800/600", "mov5.jpg"),
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
