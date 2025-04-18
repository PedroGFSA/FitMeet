import { Activity } from "@/types/activity";
import { formatISODateToBr } from "@/utils/functions";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Lock, LockOpen } from "lucide-react";
import { AdvancedMarker, APIProvider, Map } from "@vis.gl/react-google-maps";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useEffect, useState } from "react";

interface props {
  activity: Activity;
  handleClose: () => void;
}

interface participant {
  id: string;
  name: string;
  avatar: string;
  userId: string;
  subscriptionStatus: string;
}

function ViewActivity({ activity, handleClose }: props) {
  const { latitude, longitude } = activity.address;
  const center = { lat: latitude, lng: longitude };
  const [participants, setParticipants] = useState<participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserParticipant, setIsUserParticipant] = useState<participant | null | undefined>(null);
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsUserParticipant(participants.find(participant => participant.userId === user.id));
  }, [participants, isUserParticipant]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/activities/${activity.id}/participants`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => setParticipants(data));
  }, [activity, setIsUserParticipant, isUserParticipant]);

  function handleSubscribe() {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/activities/${activity.id}/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
          setIsUserParticipant({...isUserParticipant!, subscriptionStatus: data.subscriptionStatus});
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleUnsubscribe() {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/activities/${activity.id}/unsubscribe`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(() => {
          setIsUserParticipant(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Dialog open={true} onOpenChange={handleClose}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hidden">Preferences</Button>
        </DialogTrigger>
        <DialogContent className="w-[848px] h-[752px] py-12 px-12">
          <div className="flex gap-12">
            <div className="w-[54.7%] h-full">
              <div className="w-full h-56">
                <img src={activity.image} alt={activity.title} className="w-full h-full object-cover rounded-md" />
              </div>
              <h3 className="text-[2rem]/9 font-normal font-bebas-neue pt-6 pb-2">{activity.title}</h3>
              <p className="text-md/6 font-normal text-neutral-700 pb-6">{activity.description}</p>
              <div className="flex flex-col justify-end">
                <div className="flex flex-col gap-2 pb-10">
                  <span className="flex gap-[9.5px] items-center">
                    <div className="w-[21px] h-[21px]">
                      <img src="src/assets/images/calendar.svg" alt="calendar" className="w-full h-full" />
                    </div>
                    <span>{formatISODateToBr(activity.scheduledDate)}</span>
                  </span>
                  <span className="flex gap-[9.5px] items-center">
                    <div className="w-[23px] h-[20px]">
                      <img src="src/assets/images/people.svg" alt="People" className="w-full h-full" />
                    </div>
                    <span>{activity.participantCount} participantes</span>
                  </span>
                  <span className="flex gap-[9.5px] items-center">
                    <div className="w-[21px] h-[21px] color-primary-600">
                      {activity.private ? <Lock className="h-full w-full"/> : <LockOpen className="h-full w-full"/>}
                    </div>
                    <span>{activity.private ? 'Mediante aprovação' : 'Livre participação'}</span>
                  </span>
                </div>
                { 
                !isUserParticipant ? 
                <Button variant="default" className={`w-56 h-12 px-3 py-4 rounded-sm bg-primary-500 font-bold text-md/6 hover:cursor-pointer focus-visible:ring-0 ${isLoading ? 'opacity-50' : ''}`} onClick={() => handleSubscribe()}>Participar</Button> : isUserParticipant.subscriptionStatus === 'PENDING' ?
                 <Button variant="default" className="w-56 h-12 px-3 py-4 rounded-sm bg-primary-500 font-bold text-md/6 hover:cursor-pointer focus-visible:ring-0">Aguardando aprovação</Button> :  
                 isUserParticipant.subscriptionStatus === 'DENIED' ? 
                 <Button variant="default" className="w-56 h-12 px-3 py-4 rounded-sm bg-red-500 font-bold text-md/6 hover:cursor-pointer focus-visible:ring-0">Inscrição negada</Button> :
                isUserParticipant.subscriptionStatus === 'APPROVED' ?
                <Button variant="default" className={`w-56 h-12 px-3 py-4 rounded-sm font-bold bg-white text-red-600 border border-red-600 text-md/6 hover:cursor-pointer hover:bg-neutral-100 focus-visible:ring-0 ${isLoading ? 'opacity-50' : ''}`} onClick={() => handleUnsubscribe()}>Desinscrever</Button> : 
                <Button variant="default" className="w-56 h-12 px-3 py-4 rounded-sm bg-primary-500 font-bold text-md/6 hover:cursor-pointer focus-visible:ring-0">Editar</Button>
                }
              </div>
            </div>

            <div className="w-[45.3%] h-full">
              <div>
                <p className="text-[1.75rem]/8 font-bebas-neue font-normal text-neutral-900 pb-2">Ponto de encontro</p>
                <div className="w-full h-52 rounded-md">
                  <Map
                    center={center}
                    zoom={15}
                    mapId={`${import.meta.env.VITE_MAP_ID}`}
                    disableDefaultUI={true}
                    gestureHandling={'greedy'}
                  >
                    <AdvancedMarker
                      position={center}
                    />
                  </Map>
                </div>
                <div>
                  <p className="text-[1.75rem]/8 font-bebas-neue font-normal text-neutral-900 pt-10 pb-2">Participantes</p>
                    <ScrollArea className="h-75 rounded-md  overflow-y-auto p-4" style={{scrollbarWidth: 'thin', scrollbarColor: 'var(--color-neutral-800) var(--color-neutral-200)', scrollbarGutter: 'stable'}}>
                      <div className="flex flex-col items-start gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-13 h-13 relative rounded-full outline-gradient bg-gradient flex items-center justify-center">
                              <img src={activity.creator.avatar} alt={activity.creator.name} className="w-11 h-11 rounded-full absolute outline-2 outline-white top-[4.25px] " />
                            </div>
                            <span className="flex flex-col">{activity.creator.name.split(' ')[0] + ' ' + activity.creator.name.split(' ')[activity.creator.name.split(' ').length - 1]} <span className="text-neutral-700 text-xs/4">Organizador</span></span>
                          </div>
                        {participants.map((participant) => (
                          <div key={participant.id} className="flex items-center gap-2">
                            <div className="w-13 h-13 relative rounded-full outline-gradient bg-gradient flex items-center justify-center">
                              <img src={participant.avatar} alt={participant.name} className="w-11 h-11 rounded-full absolute outline-2 outline-white top-[4.25px] " />
                            </div>
                            <span>{participant.name}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </APIProvider>
  );
}

export default ViewActivity;
