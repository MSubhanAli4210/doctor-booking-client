import {
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import axios from "axios";

import type {
  PatientAppointment,
} from "../api/appointmentApi";

/**
 * PatientAppointment currently does not expose `fees`,
 * so extend it locally for this payment component.
 */
type PaymentAppointment =
  PatientAppointment & {
    fees?: number;
  };

interface PaymentModalProps {
  appointment: PaymentAppointment;
  onClose: () => void;
  onSuccess: (
    appointment: PatientAppointment,
  ) => void;
}

interface PaymentForm {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

interface PaymentResponse {
  appointment?: PatientAppointment;
  message?: string;
}

const initialForm: PaymentForm = {
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvv: "",
};

/**
 * Local payment API call.
 *
 * This replaces the missing:
 *
 * import { processAppointmentPayment }
 *   from "../api/appointmentApi";
 */
const processAppointmentPayment =
  async (
    appointmentId: string,
    paymentData: PaymentForm,
  ): Promise<PaymentResponse> => {
    const apiBase =
      (
        import.meta.env
          .VITE_API_URL as
          | string
          | undefined
      )?.replace(/\/$/, "") ||
      "/api";

    const response =
      await axios.post<PaymentResponse>(
        `${apiBase}/appointments/${appointmentId}/payment`,
        paymentData,
        {
          headers: {
            Authorization:
              localStorage.getItem(
                "token",
              )
                ? `Bearer ${localStorage.getItem(
                    "token",
                  )}`
                : undefined,
          },
        },
      );

    return response.data;
  };

export default function PaymentModal({
  appointment,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [
    formData,
    setFormData,
  ] =
    useState<PaymentForm>(
      initialForm,
    );

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const {
      name,
      value,
    } = event.target;

    let nextValue =
      value;

    if (
      name ===
      "cardNumber"
    ) {
      nextValue =
        value
          .replace(/\D/g, "")
          .slice(0, 19);
    }

    if (
      name ===
      "expiryMonth"
    ) {
      nextValue =
        value
          .replace(/\D/g, "")
          .slice(0, 2);
    }

    if (
      name ===
      "expiryYear"
    ) {
      nextValue =
        value
          .replace(/\D/g, "")
          .slice(0, 4);
    }

    if (
      name === "cvv"
    ) {
      nextValue =
        value
          .replace(/\D/g, "")
          .slice(0, 4);
    }

    setFormData(
      (previous) => ({
        ...previous,
        [name]:
          nextValue,
      }),
    );

    setError("");
  };

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const month =
        Number(
          formData.expiryMonth,
        );

      const year =
        Number(
          formData.expiryYear,
        );

      if (
        formData.cardNumber.length <
        12
      ) {
        setError(
          "Please enter a valid card number.",
        );

        return;
      }

      if (
        month < 1 ||
        month > 12
      ) {
        setError(
          "Please enter a valid expiry month.",
        );

        return;
      }

      if (
        year < 2000
      ) {
        setError(
          "Please enter a valid expiry year.",
        );

        return;
      }

      if (
        formData.cvv.length <
        3
      ) {
        setError(
          "Please enter a valid CVV.",
        );

        return;
      }

      try {
        setProcessing(
          true,
        );

        setError("");

        const data =
          await processAppointmentPayment(
            appointment._id,
            formData,
          );

        if (
          data.appointment
        ) {
          onSuccess(
            data.appointment,
          );

          return;
        }

        setError(
          data.message ||
            "Payment was processed, but the updated appointment was not returned.",
        );
      } catch (error) {
        console.error(
          "Payment failed:",
          error,
        );

        if (
          axios.isAxiosError(
            error,
          )
        ) {
          setError(
            error.response
              ?.data?.message ||
              error.response
                ?.data?.error ||
              "Payment failed. Please try again.",
          );
        } else {
          setError(
            "Payment failed. Please try again.",
          );
        }
      } finally {
        setProcessing(
          false,
        );
      }
    };

  const doctorName =
    appointment.doctor
      ?.user?.name ||
    "Doctor";

  const fee =
    appointment.fees ??
    0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close payment"
        onClick={onClose}
        disabled={processing}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.3)]">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                Secure payment
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Pay consultation fee
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Dr.{" "}
                {doctorName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={
                processing
              }
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ×
            </button>
          </div>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="p-6">
            <div className="mb-6 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Amount due
              </p>

              <p className="mt-2 text-3xl font-black">
                ${fee}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="cardNumber"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Card number
              </label>

              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                value={
                  formData.cardNumber
                }
                onChange={
                  handleChange
                }
                placeholder="4242424242424242"
                required
                disabled={
                  processing
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="expiryMonth"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Month
                </label>

                <input
                  id="expiryMonth"
                  name="expiryMonth"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp-month"
                  value={
                    formData.expiryMonth
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="12"
                  required
                  disabled={
                    processing
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="expiryYear"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Year
                </label>

                <input
                  id="expiryYear"
                  name="expiryYear"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp-year"
                  value={
                    formData.expiryYear
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="2030"
                  required
                  disabled={
                    processing
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="cvv"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  CVV
                </label>

                <input
                  id="cvv"
                  name="cvv"
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={
                    formData.cvv
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="123"
                  required
                  disabled={
                    processing
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
              This project uses simulated card
              processing. No real charge is made.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              disabled={
                processing
              }
              className="h-12 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                processing
              }
              className="flex h-12 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing
                ? "Processing..."
                : `Pay $${fee}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}