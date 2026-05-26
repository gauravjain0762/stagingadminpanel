import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Review } from "@/types";
import { dummyReviews, sentimentData } from "@/lib/dummyData";

interface ReviewsState {
  list: Review[];
  loading: boolean;
  error: string | null;
  filters: { status: string; search: string };
  pagination: { page: number; limit: number; total: number };
  sentimentChart: typeof sentimentData;
}

const initialState: ReviewsState = {
  list: [],
  loading: false,
  error: null,
  filters: { status: "", search: "" },
  pagination: { page: 1, limit: 10, total: 0 },
  sentimentChart: [],
};

export const fetchReviews = createAsyncThunk("reviews/fetchAll", async () => {
  await new Promise((r) => setTimeout(r, 400));
  return { reviews: dummyReviews, sentiment: sentimentData };
});

export const updateReviewStatus = createAsyncThunk(
  "reviews/updateStatus",
  async ({ id, status }: { id: string; status: Review["status"] }) => {
    await new Promise((r) => setTimeout(r, 300));
    return { id, status };
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<ReviewsState["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => { state.loading = true; })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.reviews;
        state.sentimentChart = action.payload.sentiment;
        state.pagination.total = action.payload.reviews.length;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed";
      })
      .addCase(updateReviewStatus.fulfilled, (state, action) => {
        const r = state.list.find((r) => r.id === action.payload.id);
        if (r) r.status = action.payload.status;
      });
  },
});

export const { setFilter: setReviewsFilter, setPage: setReviewsPage } = reviewsSlice.actions;
export default reviewsSlice.reducer;

