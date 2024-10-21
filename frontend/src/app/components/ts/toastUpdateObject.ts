import { TypeOptions } from 'react-toastify';

type ToastTypes = TypeOptions;

export default function toastUpdateOptions(
  message: string,
  toastType: ToastTypes,
  autoCloseDuration = 5000,
) {
  return {
    render: message,
    type: toastType,
    isLoading: false,
    autoClose: autoCloseDuration,
    closeButton: true,
    closeOnClick: true,
  };
}
