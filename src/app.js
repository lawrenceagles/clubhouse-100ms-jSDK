import {
	HMSReactiveStore,
	selectPeers,
	selectIsConnectedToRoom,
	selectIsLocalAudioEnabled,
	selectLocalPeerRole
} from '@100mslive/hms-video-store';

import { getToken, createElem } from '../utils';

const hms = new HMSReactiveStore();
console.log('hms', hms);
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
		const peerDesc = createElem(
			'p',
			{
				class: 'text-white font-bold'
			},
			`${peer.name}${peer.isLocal ? ' (You)' : ''}-${peer.roleName} `
		);

		const MuteItem = createElem(
			'li',
			{ id: 'mute', class: 'cursor-pointer' },
			createElem(
				'span',
				{
					class: 'rounded-t bg-gray-200 hover:bg-gray-400 py-2 px-4 block'
				},
				'Unmute'
			)
		);

		const SpeakerItem = createElem(
			'li',
			{ id: 'speaker', class: 'cursor-pointer' },
			createElem(
				'span',
				{
					class: 'bg-gray-200 hover:bg-gray-400 py-2 px-4 block'
				},
				'Make speaker'
			)
		);

		const ListenerItem = createElem(
			'li',
			{ id: 'listener', class: 'cursor-pointer' },
			createElem(
				'span',
				{
					class: 'rounded-b bg-gray-200 hover:bg-gray-400 py-2 px-4 block'
				},
				'Make listener'
			)
		);

		const menu = createElem(
			'button',
			{ class: 'text-white font-bold text-3xl z-20 rounded inline-flex items-centerr' },
			'...'
		);

		const dropdown = createElem(
			'ul',
			{ class: 'dropdown-menu absolute top-4 right-0 hidden text-gray-700 w-max pt-1 group-hover:block z-50' },
			MuteItem,
			SpeakerItem,
			ListenerItem
		);

		const menuContainer = createElem(
			'div',
			{
				class: `dropdown inline-block absolute top-0 right-8`
			},
			menu,
			dropdown
		);

		const peerContainer = createElem(
			'div',
			{
				class:
					'relative w-full p-4 bg-gray-900 rounded-lg sahdow-lg overflow-hidden flex flex-col justify-center items-center'
			},
			menuContainer,
			peerAvatar,
			peerDesc
		);

		// appends children
		PeersContainer.append(peerContainer);
	});

	// get DOM elements
	const mute = document.querySelector('#mute');
	const listener = document.querySelector('#listener');
	const speaker = document.querySelector('#speaker');

	// hanadle mute/unmute
	if (mute) {
		mute.addEventListener('click', () => {
			// know user permissions
			const role = hmsStore.getState(selectLocalPeerRole);
			// if (!role.permissions.mute) {
			// 	alert('You do not have the permission to mute a peer!');
			// 	return;
			// }

			let audioEnabled = hmsStore.getState(selectIsLocalAudioEnabled);
			mute.firstElementChild.innerText = audioEnabled ? 'Unmute' : 'Mute';
			hmsActions.setLocalAudioEnabled(!audioEnabled);
		});
	}

	// handle change role
	if (listener) {
		listener.addEventListener('click', () => {
			// know users permissions
			const role = hmsStore.getState(selectLocalPeerRole);
			// if (!role.permissions.changeRole) {
			// 	alert('You do not have the permission to change role!');
			// 	return;
			// }

			hmsActions.changeRole(peer.id, 'listener', force);

			console.log('role is: ', role);
		});
	}

	if (speaker) {
		speaker.addEventListener('click', () => {
			// know users permissions
			const role = hmsStore.getState(selectLocalPeerRole);
			// if (!role.permissions.changeRole) {
			// 	alert('You do not have the permission to change role!');
			// 	return;
			// }

			hmsActions.changeRole(peer.id, 'speaker', force);

			console.log('role is: ', role);
		});
	}
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

// change role
// 💡 A list of all available role names in the current room can be accessed via the selectAvailableRoleNames selector.
// Further the selectRoleByRoleName selector can be used to get the full HMSRole object for a role name.
// hmsActions.changeRole(forPeerId, toRoleName, force);

// handle role change request
// function handleRoleChangeRequest(request) {
// 	if (!request) {
// 		return;
// 	}
// 	console.log(`${request.requestedBy.name} requested role change to - ${request.role.name}`);
// 	// shouldAccept can for example present a pop up to the user for deciding how to act on the request
// 	const accept = shouldAccept(request);
// 	if (accept) {
// 		hmsActions.acceptChangeRole(request);
// 	} else {
// 		hmsActions.rejectChangeRole(request);
// 	}
// }

// hmsStore.subscribe(handleRoleChangeRequest, selectRoleChangeRequest);
