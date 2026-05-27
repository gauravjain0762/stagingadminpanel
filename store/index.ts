import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./slices/dashboardSlice";
// import doctorsReducer from "./slices/doctorsSlice";
import allDoctorsReducer from "./slices/allDoctorsSlice";
import clinicsReducer from "./slices/clinicsSlice";
import patientsReducer from "./slices/patientsSlice";
import appointmentsReducer from "./slices/appointmentsSlice";
import queueReducer from "./slices/queueSlice";
import paymentsReducer from "./slices/paymentsSlice";
import verificationReducer from "./slices/verificationSlice";
import reviewsReducer from "./slices/reviewsSlice";
import notificationsReducer from "./slices/notificationsSlice";
import supportReducer from "./slices/supportSlice";
import uiReducer from "./slices/uiSlice";
import pendingDoctorsReducer from "./slices/pendingDoctorsSlice";
import doctorAnalyticsReducer from "./slices/doctorAnalyticsSlice";
import doctorPatientsReducer from "./slices/doctorPatientsSlice";
import appSettingsReducer from "./slices/appSettingsSlice";
import plansReducer from "./slices/plansSlice";
import deletedDoctorsReducer from "./slices/deletedDoctorsSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    allDoctors: allDoctorsReducer,
    pendingDoctors: pendingDoctorsReducer,
    clinics: clinicsReducer,
    patients: patientsReducer,
    appointments: appointmentsReducer,
    queue: queueReducer,
    payments: paymentsReducer,
    verification: verificationReducer,
    reviews: reviewsReducer,
    notifications: notificationsReducer,
    support: supportReducer,
    ui: uiReducer,
    doctorAnalytics: doctorAnalyticsReducer,
    doctorPatients: doctorPatientsReducer,
    appSettings: appSettingsReducer,
    plans: plansReducer,
    deletedDoctors: deletedDoctorsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
