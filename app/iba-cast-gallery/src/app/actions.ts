
"use server";

import { getActiveCasts } from "services/castService";

export async function getActiveCastsAction() {
    return await getActiveCasts();
}
