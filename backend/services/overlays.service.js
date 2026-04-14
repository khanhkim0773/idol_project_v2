import { supabase } from "../config/supabase.js";

// Lấy danh sách toàn bộ overlays
export const loadOverlays = async () => {
  try {
    const { data, error } = await supabase
      .from("overlays")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("[overlays] Could not read overlays from Supabase:", e.message);
    return [];
  }
};

// Lấy 1 overlay theo id
export const getOverlayById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("overlays")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error(`[overlays] Could not get overlay ${id}:`, e.message);
    return null;
  }
};

// Tạo overlay mới
export const createOverlay = async (overlayData) => {
  try {
    const { data, error } = await supabase
      .from("overlays")
      .insert([overlayData])
      .select();

    if (error) throw error;
    return { saved: true, data: data[0] };
  } catch (e) {
    console.error("[overlays] Error in createOverlay:", e.message);
    return { saved: false, error: e.message };
  }
};

// Cập nhật overlay
export const updateOverlay = async (id, patch) => {
  try {
    const { data, error } = await supabase
      .from("overlays")
      .update(patch)
      .eq("id", Number(id))
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return { updated: false, error: "Not found" };
    
    return { updated: true, data: data[0] };
  } catch (e) {
    console.error("[overlays] Error in updateOverlay:", e.message);
    return { updated: false, error: e.message };
  }
};

// Xóa overlay
export const deleteOverlay = async (id) => {
  try {
    // Lưu ý: nên cho overlayId trong gifts thành null trước hoặc dùng ON DELETE SET NULL nếu config ở DB
    await supabase.from("gifts").update({ overlayId: null }).eq("overlayId", Number(id));

    const { data, error } = await supabase
      .from("overlays")
      .delete()
      .eq("id", Number(id))
      .select();

    if (error) throw error;
    
    return { deleted: true, data: data[0] };
  } catch (e) {
    console.error("[overlays] Error in deleteOverlay:", e.message);
    return { deleted: false, error: e.message };
  }
};
