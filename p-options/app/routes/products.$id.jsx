import db from "../db.server";

import { json } from "@remix-run/node";

export const action = async ({request, params}) => {
    const data = {status: 200};
    return json(data);
}

export const loader = async ({request}) => {
    return {"ddd": 3333};
}   