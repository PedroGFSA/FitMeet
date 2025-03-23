import { Router } from "express";
import { getActivitiesPaginated, getAllActivities, getActivityTypes, getActivitiesCreatedByUser, getAllActivitiesCreatedByUser, getActivitiesUserParticipant, getAllActivitiesUserParticipant, getAllActivityParticipants,
  createNewActivity
 } from "../controllers/activities-controller";
import { authGuard } from "../middlewares/auth-guard";

const activitiesRouter = Router();

activitiesRouter.get("/activities/types", authGuard, getActivityTypes);
activitiesRouter.get("/activities", authGuard, getActivitiesPaginated);
activitiesRouter.get("/activities/all", authGuard, getAllActivities);
activitiesRouter.get("/activities/user/creator", authGuard, getActivitiesCreatedByUser);
activitiesRouter.get("/activities/user/creator/all", authGuard, getAllActivitiesCreatedByUser);
activitiesRouter.get("/activities/user/participant", authGuard, getActivitiesUserParticipant);
activitiesRouter.get("/activities/user/participant/all", authGuard, getAllActivitiesUserParticipant);
activitiesRouter.get("/activities/:id/participants", authGuard, getAllActivityParticipants);
activitiesRouter.post("/activities/new", authGuard, createNewActivity);
activitiesRouter.post("/activities/:id/subscribe", authGuard, () => {});
activitiesRouter.put("/activities/:id/update", authGuard, () => {});
activitiesRouter.put("/activities/:id/conclude", authGuard, () => {});
activitiesRouter.put("/activities/:id/approve", authGuard, () => {});
activitiesRouter.put("/activities/:id/check-in", authGuard, () => {});
activitiesRouter.delete("/activities/:id/unsubscribe", authGuard, () => {});
activitiesRouter.delete("/activities/:id/delete", authGuard, () => {});

export default activitiesRouter;