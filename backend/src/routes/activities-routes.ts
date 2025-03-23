import { Router } from "express";
import { getActivitiesPaginated, getAllActivities } from "../controllers/activities-controller";
import { authGuard } from "../middlewares/auth-guard";

const activitiesRouter = Router();

activitiesRouter.get("/activities/types", authGuard, () => {});
activitiesRouter.get("/activities", authGuard, getActivitiesPaginated);
activitiesRouter.get("/activities/all", authGuard, getAllActivities);
activitiesRouter.get("/activities/user/creator", authGuard, () => {});
activitiesRouter.get("/activities/user/participant", authGuard, () => {});
activitiesRouter.get("/activities/user/participant/all", authGuard, () => {});
activitiesRouter.get("/activities/:id/participants", authGuard, () => {});
activitiesRouter.post("/activities/new", authGuard, () => {});
activitiesRouter.post("/activities/:id/subscribe", authGuard, () => {});
activitiesRouter.put("/activities/:id/update", authGuard, () => {});
activitiesRouter.put("/activities/:id/conclude", authGuard, () => {});
activitiesRouter.put("/activities/:id/approve", authGuard, () => {});
activitiesRouter.put("/activities/:id/check-in", authGuard, () => {});
activitiesRouter.delete("/activities/:id/unsubscribe", authGuard, () => {});
activitiesRouter.delete("/activities/:id/delete", authGuard, () => {});

export default activitiesRouter;