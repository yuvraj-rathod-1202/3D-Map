import { app } from "./firebase.config";
import { doc, getDoc, getFirestore, query, setDoc } from 'firebase/firestore';
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
        await setDoc(doc(firebase, "messages", messageData.id), {
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
        await setDoc(doc(firebase, "events", eventData.id), {
            event: eventData.event,
            sender: eventData.sender,
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
            event: eventData.event,
            sender: eventData.sender,
        });
    }catch(e){
        console.error("Error adding document: ", e);
    }
}

const setImagedata = async (image) => {
    const storageRef = ref(storage, `images/${image.name}`);
    await uploadBytes(storageRef, image);
}

const getImageData = async (imageName) => {
    const storageRef = ref(storage, `images/${imageName}`);
    const url = await getDownloadURL(storageRef);
    return url;
}

const setImageData = async (imageData) => {
    await setDoc(doc(firebase, "imageData", imageData.id), {
        name: imageData.name,
        sender: imageData.sender,
    });
}

const fetchImageData = async () => {
    const images = [];
    const querySnapshot = await getDocs(collection(firebase, "imageData"));
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
    }catch(e){
        console.error("Error adding document: ", e);
    }
}
