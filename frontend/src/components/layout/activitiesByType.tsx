import { Activity } from "@/types/activity";
import AltActivityCard from "./altActivityCard";
import { useState } from "react";
import { useEffect } from "react";
import { Button } from "../ui/button";

interface props {
  typeName: string;
  typeId: string;
  onClick: (activity: Activity) => void;
}

export default function ActivitiesByType({ typeName, typeId, onClick }: props) {
  const jwtToken = localStorage.getItem('token');
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/activities?typeId=${typeId}&page=1&pageSize=6`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    })
    .then(response => response.json())
    .then(data => setActivities(data.activities));

  }, [])

  if (activities.length > 0) return (
    <div className="">
      <div className="flex justify-between items-center">
        <h3 className="text-[28px]/8  font-bebas-neue mb-4">{typeName}</h3>
        <Button variant="link" className="text-md font-bold text-primary-500 hover:cursor-pointer">Ver mais</Button>
      </div>
      <div className="grid grid-cols-2 gap-y-3 gap-x-6">
        {activities.map((activity) => (
          <div className="hover:cursor-pointer hover:scale-[1.02] transition-all duration-300" onClick={() => onClick(activity)}>
            <AltActivityCard key={activity.id} title={activity.title} scheduledDate={activity.scheduledDate} participantCount={activity.participantCount} image={activity.image} isPrivate={activity.private} />
          </div>
        ))}
      </div>
    </div>
  )
}
