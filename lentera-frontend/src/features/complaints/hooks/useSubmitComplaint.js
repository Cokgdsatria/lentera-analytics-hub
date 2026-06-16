import { useState } from 'react';
import { complaintApi } from '../../../services/api';

export function useSubmitComplaint() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const submitComplaint = async (formData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            return await complaintApi.create(formData);
        } catch (err) {
            setError(err.message || 'Failed to submit complaint.');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { submitComplaint, isSubmitting, error };
}
