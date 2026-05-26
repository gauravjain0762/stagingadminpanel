import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  modalData: unknown;
  globalSearch: string;
  theme: "dark";
}

const initialState: UIState = {
  sidebarCollapsed: false,
  activeModal: null,
  modalData: null,
  globalSearch: "",
  theme: "dark",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    openModal(state, action: PayloadAction<{ modal: string; data?: unknown }>) {
      state.activeModal = action.payload.modal;
      state.modalData = action.payload.data || null;
    },
    closeModal(state) {
      state.activeModal = null;
      state.modalData = null;
    },
    setGlobalSearch(state, action: PayloadAction<string>) {
      state.globalSearch = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, openModal, closeModal, setGlobalSearch } =
  uiSlice.actions;
export default uiSlice.reducer;

