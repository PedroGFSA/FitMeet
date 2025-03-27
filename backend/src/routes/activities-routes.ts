import { Router } from "express";
import {
  getActivitiesPaginated,
  getAllActivities,
  getActivityTypes,
  getActivitiesCreatedByUser,
  getAllActivitiesCreatedByUser,
  getActivitiesUserParticipant,
  getAllActivitiesUserParticipant,
  getAllActivityParticipants,
  createNewActivity,
  subscribeToActivity,
  updateActivity,
  concludeActivity,
  approveParticipantForActivity,
  checkInForActivity,
  unsubscribeToActivity,
  deleteActivity,
} from "../controllers/activities-controller";
import { authGuard } from "../middlewares/auth-guard";
import upload from "../utils/multer";

const activitiesRouter = Router();

activitiesRouter.get("/activities/types", authGuard, getActivityTypes);
activitiesRouter.get("/activities", authGuard, getActivitiesPaginated);
activitiesRouter.get("/activities/all", authGuard, getAllActivities);
activitiesRouter.get(
  "/activities/user/creator",
  authGuard,
  getActivitiesCreatedByUser
);
activitiesRouter.get(
  "/activities/user/creator/all",
  authGuard,
  getAllActivitiesCreatedByUser
);
activitiesRouter.get(
  "/activities/user/participant",
  authGuard,
  getActivitiesUserParticipant
);
activitiesRouter.get(
  "/activities/user/participant/all",
  authGuard,
  getAllActivitiesUserParticipant
);
activitiesRouter.get(
  "/activities/:id/participants",
  authGuard,
  getAllActivityParticipants
);
activitiesRouter.post("/activities/new", authGuard, upload.single("image"), createNewActivity);
activitiesRouter.post(
  "/activities/:id/subscribe",
  authGuard,
  subscribeToActivity
);
activitiesRouter.put("/activities/:id/update", authGuard, upload.single("image"), updateActivity);
activitiesRouter.put("/activities/:id/conclude", authGuard, concludeActivity);
activitiesRouter.put(
  "/activities/:id/approve",
  authGuard,
  approveParticipantForActivity
);
activitiesRouter.put("/activities/:id/check-in", authGuard, checkInForActivity);
activitiesRouter.delete(
  "/activities/:id/unsubscribe",
  authGuard,
  unsubscribeToActivity
);
activitiesRouter.delete("/activities/:id/delete", authGuard, deleteActivity);

export default activitiesRouter;
