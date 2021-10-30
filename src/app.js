import {
	HMSReactiveStore,
	selectPeers,
	selectIsConnectedToRoom,
	selectIsLocalAudioEnabled
} from '@100mslive/hms-video-store';

import { getToken, createElem } from '../utils';

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
function handleConnection(isConnected) {
	if (isConnected) {
		console.log('connected');
		// hides Form
		FormView.classList.toggle('hidden');
		// displays room
		RoomView.classList.toggle('hidden');
	} else {
		console.log('disconnected');
		// hides Form
		FormView.classList.toggle('hidden');
		// displays room
		RoomView.classList.toggle('hidden');
	}
}

// subscribe to room state
hmsStore.subscribe(handleConnection, selectIsConnectedToRoom);

// leave room

function leaveRoom() {
	hmsActions.leave();
	JoinBtn.innerHTML = 'Join';
}
LeaveRoomBtn.addEventListener('click', leaveRoom);
window.onunload = leaveRoom;

// display room

function renderPeers(peers) {
	PeersContainer.innerHTML = ''; // clears the container
	if (!peers) {
		// this allows us to make peer list an optional argument
		peers = hmsStore.getState(selectPeers);
	}
	peers.forEach((peer) => {
		// creates an image tag
		const peerAvatar = createElem('img', {
			class: 'object-center object-cover w-full h-full',
			src: 'https://cdn.pixabay.com/photo/2013/07/13/10/07/man-156584_960_720.png',
			alt: 'photo'
		});

		// create a description paragrah tag with a text
		peerDesc = createElem(
			'p',
			{
				class: 'text-white font-bold'
			},
			peer.name + '-' + peer.roleName
		);
		const peerContainer = createElem(
			'div',
			{
				class:
					'w-full bg-gray-900 rounded-lg sahdow-lg overflow-hidden flex flex-col justify-center items-center'
			},
			peerAvatar,
			peerDesc
		);

		// appends children
		PeersContainer.append(peerContainer);
	});
}
hmsStore.subscribe(renderPeers, selectPeers);

//handle mute/unmute peer

AudioBtn.addEventListener('click', () => {
	let audioEnabled = hmsStore.getState(selectIsLocalAudioEnabled);
	AudioBtn.innerText = audioEnabled ? 'Mute' : 'Unmute';
	AudioBtn.classList.toggle('bg-green-600');
	AudioBtn.classList.toggle('bg-red-600');
	hmsActions.setLocalAudioEnabled(!audioEnabled);
});
