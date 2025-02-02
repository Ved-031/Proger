import { useQueryStates, parseAsString, parseAsStringEnum } from "nuqs";

import { TaskStatus } from "../types";

export const useTaskFilters = () => {
    return useQueryStates({
        projectId: parseAsString,
        status: parseAsStringEnum(Object.values(TaskStatus)),
        assigneeId: parseAsString,
        search: parseAsString,
        dueDate: parseAsString,
    })
}