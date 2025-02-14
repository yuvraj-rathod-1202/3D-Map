import { app } from "./firebase.config";
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebase = getFirestore(app);
const storage = getStorage(app);

const addUser = async (user) => {
    try {
        await setDoc(doc(firebase, "users", user.uid), {
            user
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

const sendMessage = async (messageData) => {
    try {
        await setDoc(doc(firebase, "messages", messageData.sender), {
            message: messageData.message,
            sender: messageData.sender,
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

const fetchMessages = async () => {
    const messages = [];
    const querySnapshot = await getDocs(collection(firebase, "messages"));
    querySnapshot.forEach((doc) => {
        messages.push(doc.data());
    });
    return messages;
}

const onMessageUpdate = (callback) => {
    const querySnapshot = onSnapshot(collection(firebase, "messages"), (snapshot) => {
        fetchMessages().then((messages) => {
            return messages;
        });
    });

}

const setEventData = async (eventData) => {
      try{
          const docref = doc(firebase, "events", eventData.id);
          await setDoc(docref, {
              uid: eventData.id,
              name: eventData.name,
              description: eventData.description,
              location: eventData.location,
              start_time: eventData.start_time,
              end_time: eventData.end_time,
              genre: eventData.genre,
              tags: eventData.tags,
              ticketRequired: eventData.ticketRequired,
              booked: [],
              redeemed: [],
              sender: eventData.sender,
          });
          const userCollection = collection(firebase, "users");
          const q = query(userCollection, where("uid", "==", eventData.sender));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
              const data = doc.data();
              const createdEvents = data.createdEvents || [];
              const contributions = (data.contributions || 0) + 1;
              
              createdEvents.push(eventData.id);

              await setDoc(doc.ref, {
                  createdEvents: createdEvents,
                  contributions: contributions
              }, { merge: true });
});
      }catch(e){
          console.error("Error adding document: ", e);
      }
  }

const addSchedule = async (scheduleData) => {
    try {
        await setDoc(doc(firebase, "schedules", scheduleData.id), {
            schedule: scheduleData.schedule,
            sender: scheduleData.sender,
        });
        scheduleData.schedule.forEach((event) => {
            setEventData(event);
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

const editEvent = async (eventData) => {
    try{
        await setDoc(doc(firebase, "events", eventData.id), {
            uid: eventData.id,
            name: eventData.name,
            description: eventData.description,
            location: eventData.location,
            start_time: eventData.start_time,
            end_time: eventData.end_time,
            genre: eventData.genre,
            tags: eventData.tags,
            ticketRequired: eventData.ticketRequired,
            sender: eventData.sender
        });
    }catch(e){
        console.error("Error adding document: ", e);
    }
}

const deleteEvent = async (eventData) => {
    try{
        await deleteDoc(doc(firebase, "events", eventData.id));
        const q = query(doc(firebase, "users"), where("participantedEvents", "array-contains", eventData.id));
        const querySnapshot = await getDoc(q);
        querySnapshot.forEach(async (doc) => {
            const participantedEvents = doc.data().participantedEvents;
            participantedEvents.remove(eventData.id);
            await setDoc(doc, {
                participantedEvents: participantedEvents,
            });
        });
    }catch(e){
        console.error("Error adding document: ", e);
    }
}

const getallEvenstDetail = async () => {
    try {
        const querySnapshot = await getDocs(collection(firebase, "events")); // Pass a valid CollectionReference
        const events = querySnapshot.docs.map(doc => doc.data()); // Using map() for cleaner code
        return events;
    } catch (error) {
        console.error("Error fetching events:", error);
        return []; // Return empty array in case of error
    }
};

const setImage = async (image) => {
    const storageRef = ref(storage, `images/${image.name}`);
    await uploadBytes(storageRef, image);
}

const getImage = async (imageName) => {
    const storageRef = ref(storage, `images/${imageName}`);
    const url = await getDownloadURL(storageRef);
    return url;
}

const setImageData = async (imageData) => {
    try{
        await setDoc(doc(firebase, "imageData", imageData.id), {
            name: imageData.name,
            sender: imageData.sender,
        });
        const userdoc = doc(firebase, "users");
        const q = query(userdoc, where("uid", "==", imageData.sender));
        const doc = await getDoc(q);
        const createdImages = doc.data().createdImages;
        const contributions = doc.data().contributions;
        createdImages.push(imageData.id);
        contributions+=1;
        await setDoc(doc, {
            createdImages: createdImages,
            contributions: contributions,
        });
    }catch(e){
        console.error("Error adding document: ", e);
    }
}

const fetchImageData = async () => {
    const images = [];
    const querySnapshot = await getDoc(collection(firebase, "imageData"));
    querySnapshot.forEach((doc) => {
        images.push(doc.data());
    });
    return images;
}


const eventBookings = async (eventData) => {
    try{
        await setDoc(doc(firebase, "eventBookings", eventData.id), {
            event: eventData.event,
            booker: eventData.booker,
        });
        const userdoc = doc(firebase, "users");
        const q = query(userdoc, where("uid", "==", eventData.booker));
        const doc = await getDoc(q);
        const participantedEvents = doc.data().participantedEvents;
        participantedEvents.push(eventData.id);
        await setDoc(doc, {
            participantedEvents: participantedEvents,
        });

        const eventdoc = doc(firebase, "events");
        const q2 = query(eventdoc, where("uid", "==", eventData.id));
        const doc2 = await getDoc(q2);
        const booked = doc2.data().booked;
        booked.push(eventData.booker);
        await setDoc(doc2, {
            booked: booked,
        });
    }catch(e){
        console.error("Error adding document: ", e);
    }
}

const eventBookingsCheck = async (eventData) => {
    const userdoc = doc(firebase, "users");
    const q = query(userdoc, where("uid", "==", eventData.booker));
    const doc = await getDoc(q);
    const participantedEvents = doc.data().participantedEvents;
    if(participantedEvents.includes(eventData.id)){
        participantedEvents.remove(eventData.id);
        await setDoc(doc, {
            participantedEvents: participantedEvents,
        });

        const eventdoc = doc(firebase, "events");
        const q2 = query(eventdoc, where("uid", "==", eventData.id));
        const doc2 = await getDoc(q2);
        const booked = doc2.data().booked;
        booked.push(eventData.booker);
        await setDoc(doc2, {
            booked: booked,
        });
    }
}


const Leaderboard = async () => {
    const userdoc = doc(firebase, "users");
    const q = query(userdoc, orderBy("contributions", "desc"));
    const querySnapshot = await getDoc(q);
    const leaderboard = [];
    querySnapshot.forEach((doc) => {
        leaderboard.push(doc.data());
    });
    return leaderboard;
}

const addBarrier = async (barrierData) => {
    try {
        await setDoc(doc(firebase, "barriers", barrierData.id), {
            uid: barrierData.id,
            barrier: barrierData.barrier,
            count: 0,
            sender: barrierData.sender,
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

const barrierCountinc = async (barrierData) => {
    const barrierdoc = doc(firebase, "barriers");
    const q = query(barrierdoc, where("uid", "==", barrierData.id));
    const doc = await getDoc(q);
    const count = doc.data().count;
    count+=1;
    await setDoc(doc, {
        count: count,
    });
}

const barrierCountdec = async (barrierData) => {
    const barrierdoc = doc(firebase, "barriers");
    const q = query(barrierdoc, where("uid", "==", barrierData.id));
    const doc = await getDoc(q);
    const count = doc.data().count;
    count-=1;
    await setDoc(doc, {
        count: count,
    });
}

export { addUser, sendMessage, fetchMessages, onMessageUpdate, setEventData, addSchedule, editEvent, deleteEvent, getallEvenstDetail, setImage, getImage, setImageData, fetchImageData, eventBookings, eventBookingsCheck, Leaderboard, addBarrier, barrierCountinc, barrierCountdec };