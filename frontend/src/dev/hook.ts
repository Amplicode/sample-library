import {useEffect, useState} from 'react';
import { InitialHookStatus } from '@react-buddy/ide-toolbox';
import {securityStore} from "../index";

export const useInitial: () => InitialHookStatus = () => {
    const [status, setStatus] = useState<InitialHookStatus>({
        loading: true,
        error: false,
    });

    useEffect(() => {
        securityStore.login('admin', 'admin')
            .then(() => setStatus({error: false, loading: false}))
            .catch(() => setStatus({error: true, loading: false}))
    });

    return status;
};
