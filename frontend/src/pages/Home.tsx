import ActivitiesByType from "@/components/layout/activitiesByType";
import ActivityCard from "@/components/layout/activityCard";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Activity } from "@/types/activity";
import { ActivityType } from "@/types/activityType";
import { useEffect, useState } from "react";

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const jwtToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchActivities = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/activities?page=1&pageSize=8`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      const data = await response.json();
      setActivities(data.activities);
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchActivityTypes = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/activities/types`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      const data = await response.json();
      setActivityTypes(data);
      console.log(data);
    };
    fetchActivityTypes();
  }, []);

  return (
    <div>
      <Header />
      <main className="px-[110px]">
        <section className="pb-14">
          <div className="flex justify-between items-center pb-4">
            <h3 className="text-[28px]/8  font-bebas-neue">RECOMENDANDO PARA VOCÊ</h3>
            <Button variant="link" className="text-md font-bold text-primary-500 hover:cursor-pointer">Ver mais</Button>
          </div>
          <div className="grid grid-cols-4 gap-y-8 gap-x-3">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} title={activity.title} scheduledDate={activity.scheduledDate} participantCount={activity.participantCount} image={activity.image} isPrivate={activity.private} />
            ))}
          </div>
        </section>
        <section className="pb-14">
          <div className="flex justify-start items-center pb-4">
            <h3 className="text-[28px]/8  font-bebas-neue">TIPOS DE ATIVIDADES</h3>
          </div>
          <ul className="flex flex-wrap gap-3">
            {activityTypes.map((activityType) => (
                <li key={activityType.id} className="flex flex-col items-center gap-2 p-[5px]">
                  <img src={activityType.image} alt={activityType.name} className="w-20 h-20 rounded-full" />
                  <span className="text-neutral-900 text-md/5 font-semibold mt-3">{activityType.name}</span>
                </li>
            ))}
          </ul>
        </section>
        <section className="pb-[27px]">
          <div className="grid grid-cols-2 gap-y-10 gap-x-7">
            {activityTypes.map((activityType) => (
              <ActivitiesByType key={activityType.id} typeName={activityType.name} typeId={activityType.id} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
