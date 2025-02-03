import { useQueryState, parseAsBoolean, parseAsStringEnum } from "nuqs";
import { TaskStatus } from "../types";

export const useCreateTaskModal = () => {
    const [isOpen, setIsOpen] = useQueryState(
        "create-task", 
        parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
    );

    const [status, setStatus] = useQueryState(
        "create-status",
        parseAsStringEnum<TaskStatus>(Object.values(TaskStatus)).withOptions({ clearOnDefault: true }),
    )

    const open = (initialStatus?: TaskStatus) => {
        setIsOpen(true);
        if(initialStatus){
            setStatus(initialStatus);
        }
    }
    const close = () => {
        setStatus(null);
        setIsOpen(false);
    };

    return {
        isOpen,
        open,
        close,
        setIsOpen,
        status, 
        setStatus
    }
}