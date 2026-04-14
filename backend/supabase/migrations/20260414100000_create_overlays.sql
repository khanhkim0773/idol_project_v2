-- Bảng overlays: Danh sách hiệu ứng code
CREATE TABLE IF NOT EXISTS overlays (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'particles',
    config JSONB NOT NULL DEFAULT '{}',
    duration INTEGER DEFAULT 5,
    image TEXT,
    preview_color TEXT DEFAULT '#ff6b9d',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm cột overlayId vào bảng gifts
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS "overlayId" BIGINT REFERENCES overlays(id);
