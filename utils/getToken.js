import { v4 as uuidv4 } from 'uuid';
const TOKEN_ENDPOINT = process.env.TOKEN_ENDPOINT;
const ROOM_ID = process.env.ROOM_ID;

const getToken = async (user_role) => {
	const role = user_role.toLowerCase();
	const user_id = uuidv4();
	const room_id = ROOM_ID;
	const response = await fetch(`${TOKEN_ENDPOINT}api/token`, {
		method: 'POST',
		body: JSON.stringify({
			user_id,
			role,
			room_id
		})
	});
	const { token } = await response.json();
	return token;
};
export default getToken;
