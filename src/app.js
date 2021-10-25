import {
	HMSReactiveStore,
	selectPeers,
	selectIsConnectedToRoom,
	selectIsLocalAudioEnabled
} from '@100mslive/hms-video-store';

const hms = new HMSReactiveStore();
const hmsStore = hms.getStore();
const hmsActions = hms.getHMSActions();

// Get DOM elements
const Form = document.querySelector('#join-form');
const FormView = document.querySelector('#join-section');
const RoomView = document.querySelector('#room-section');
const PeersContainer = document.querySelector('#peers-container');
const LeaveRoomBtn = document.querySelector('#leave-room-btn');
const AudioBtn = document.querySelector('#audio-btn');
const JoinBtn = document.querySelector('#join-btn');

// handle submit form

Form.addEventListener('submit', async function handleSubmit(e) {
	// prevents form reload
	e.preventDefault();
	// get input fields
	const userName = Form.elements['username'].value; // by name
	const role = Form.elements['roles'].value; // by name
	// simple validation
	if (!userName) return; // makes sure user enters a username
	JoinBtn.innerHTML = 'Loading...';
	try {
		// gets token
		const authToken = await getToken(role);
		// joins rooms
		hmsActions.join({
			userName,
			authToken,
			settings: {
				isAudioMuted: true
			}
		});
	} catch (error) {
		// handle error
		JoinBtn.innerHTML = 'Join';
		console.log('Token API Error', error);
	}
});

// handle join room view

// leave room

// display room

//handle mute/unmute peer
