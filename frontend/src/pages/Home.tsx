import { CustomAlert } from "@/components/common/CustomAlert";
import PreferencesModal from "@/components/layout/PreferencesModal";
import ViewActivity from "@/components/layout/ViewActivity";
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
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferencesDefinedNotification, setPreferencesDefinedNotification] = useState(false);
  const [showViewActivityModal, setShowViewActivityModal] = useState<Activity | null>(null);
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
    fetch(`${import.meta.env.VITE_API_URL}/user/preferences`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.length === 0) {
        setShowPreferencesModal(true);
      }
    });
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
    };
    fetchActivityTypes();
  }, []);

  return (
    <div>
      {showPreferencesModal && <PreferencesModal open={showPreferencesModal} handleClose={() => setShowPreferencesModal(false)} handleCloseWithSuccess={() => {setShowPreferencesModal(false);setPreferencesDefinedNotification(true)}} />}
      {preferencesDefinedNotification && <CustomAlert title="Preferências definidas com sucesso" description="Sua preferências foram definidas com sucesso" variant='default' success={true} timer={4000} onClose={() => setPreferencesDefinedNotification(false)}/> }
      {showViewActivityModal && <ViewActivity activity={showViewActivityModal} handleClose={() => setShowViewActivityModal(null)} />}
      <Header />
      <main className="px-[110px]">
        <section className="pb-14">
          <div className="flex justify-between items-center pb-4">
            <h3 className="text-[28px]/8  font-bebas-neue">RECOMENDANDO PARA VOCÊ</h3>
            <Button variant="link" className="text-md font-bold text-primary-500 hover:cursor-pointer">Ver mais</Button>
          </div>
          <div className="grid grid-cols-4 gap-y-8 gap-x-3">
            {activities.map((activity) => (
              <div key={activity.id} onClick={() => setShowViewActivityModal(activity)}>
                <ActivityCard title={activity.title} scheduledDate={activity.scheduledDate} participantCount={activity.participantCount} image={activity.image} isPrivate={activity.private} />
              </div>
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
              <ActivitiesByType key={activityType.id} typeName={activityType.name} typeId={activityType.id} onClick={(activity : Activity) => setShowViewActivityModal(activity)} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
