"use client"
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { submitContact } from "@/app/actions";
import { useRef, useState } from "react";
import { contactContent, turnstileConfig } from "@/content/contact";
import { ContactTurnstile } from "./ContactTurnstile";

// 1. Define la estructura de los datos del formulario
interface FormData {
    nombre_completo: string;
    email: string;
    telefono: string;
    tipo_proyecto: string;
    etapa_proyecto: string;
    tiene_plano: string;
    mensaje: string; // El '?' lo hace opcional
}

// 2. Crea las reglas de validación con yup
const schema = yup.object({
    nombre_completo: yup.string().required("El nombre es obligatorio."),
    email: yup.string().required("El correo es obligatorio.").email("Debe ser un correo válido."),
    telefono: yup.string().required("El teléfono es obligatorio."),
    tipo_proyecto: yup.string().required("Debes seleccionar un tipo de proyecto."),
    etapa_proyecto: yup.string().required("Debes seleccionar la etapa del proyecto."),
    tiene_plano: yup.string().required("Debes indicar si tienes plano o medidas."),
    mensaje: yup.string().required("El mensaje es obligatorio."),
}).required();

const TestimonialForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({ resolver: yupResolver(schema) });

    const form = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [challengeVersion, setChallengeVersion] = useState(0);
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

    const sendEmail = async () => {
        if (!form.current) return console.error("Form reference is null");
        if (isSubmitting) return;
        if (!turnstileSiteKey || !turnstileToken) {
            toast.error(contactContent.protection.required, { position: "top-center" });
            return;
        }

        try {
            setIsSubmitting(true);

            const fd = new FormData(form.current);
            fd.set(turnstileConfig.tokenFieldName, turnstileToken);
            const result = (await submitContact(fd)) as { ok: boolean; error?: string; };

            if (result?.ok) {
                toast.success("¡Consulta recibida! Nos pondremos en contacto pronto.", { position: "top-center" });
                reset();
            } else {
                toast.error(result?.error || "No se pudo enviar el mensaje", {
                    position: "top-center",
                });
            }
        } catch {
            toast.error(contactContent.sendError, { position: "top-center" });
        } finally {
            // Turnstile tokens are single-use, including failed submissions.
            setTurnstileToken("");
            setChallengeVersion((version) => version + 1);
            setIsSubmitting(false);
        }
    };

    return (
        // 5. Conecta handleSubmit al evento onSubmit del formulario
        <form ref={form} onSubmit={handleSubmit(sendEmail)}>
            <div hidden aria-hidden="true">
                <label htmlFor="contact-website">{contactContent.honeypotLabel}</label>
                <input id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="row">
                {/* --- Nombre Completo --- */}
                <div className="col-lg-12">
                    <div className="contact__from-input mb-20">
                        <label>Nombre completo*</label>
                        <input type="text" {...register("nombre_completo")} placeholder="Ej: Juan Pérez" />
                        <p className="form_error">{errors.nombre_completo?.message}</p>
                    </div>
                </div>

                {/* --- Correo Electrónico --- */}
                <div className="col-lg-6">
                    <div className="contact__from-input mb-20">
                        <label>Correo electrónico*</label>
                        <input type="email" {...register("email")} placeholder="ejemplo@correo.com" />
                        <p className="form_error">{errors.email?.message}</p>
                    </div>
                </div>

                {/* --- Teléfono --- */}
                <div className="col-lg-6">
                    <div className="contact__from-input mb-20">
                        <label>Teléfono*</label>
                        <input type="tel" {...register("telefono")} placeholder="Ej: 11 1234 5678" />
                        <p className="form_error">{errors.telefono?.message}</p>
                    </div>
                </div>

                {/* --- Tipo de Proyecto --- */}
                <div className="col-lg-6">
                    <div className="contact__from-input mb-20">
                        <label>Tipo de proyecto*</label>
                        <select {...register("tipo_proyecto")}>
                            <option value="">Seleccionar...</option>
                            <option value="Cocina">Cocina</option>
                            <option value="Ambiente completo">Ambiente completo</option>
                            <option value="Casa completa">Casa completa</option>
                            <option value="Otro">Otro</option>
                        </select>
                        <p className="form_error">{errors.tipo_proyecto?.message}</p>
                    </div>
                </div>

                {/* --- Etapa del Proyecto --- */}
                <div className="col-lg-6">
                    <div className="contact__from-input mb-20">
                        <label>Etapa del proyecto*</label>
                        <select {...register("etapa_proyecto")}>
                            <option value="">Seleccionar...</option>
                            <option value="Obra nueva">Obra nueva</option>
                            <option value="Remodelación">Remodelación</option>
                            <option value="Idea a futuro">Idea a futuro</option>
                        </select>
                        <p className="form_error">{errors.etapa_proyecto?.message}</p>
                    </div>
                </div>

                {/* --- ¿Tenés plano o medidas? --- */}
                <div className="col-lg-6">
                    <div className="contact__from-input mb-20">
                        <label>¿Tenés plano o medidas?*</label>
                        <select {...register("tiene_plano")}>
                            <option value="">Seleccionar...</option>
                            <option value="Sí">Sí</option>
                            <option value="En proceso">En proceso</option>
                            <option value="No todavía">No todavía</option>
                        </select>
                        <p className="form_error">{errors.tiene_plano?.message}</p>
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="contact__from-input mb-20">
                        <label>Consulta o comentario</label>
                        <textarea {...register("mensaje")} placeholder="Escribe tu mensaje aquí..." rows={5}></textarea>
                        <p className="form_error">{errors.mensaje?.message}</p>
                    </div>
                </div>

                {/* --- Botón de Envío --- */}
                <div className="col-12">
                    <ContactTurnstile
                        key={challengeVersion}
                        siteKey={turnstileSiteKey}
                        onTokenChange={setTurnstileToken}
                    />
                    <div className="testimonials_btn text-center">
                        <button type="submit" className="primary-btn-4 btn-hover btn-hover-2" disabled={isSubmitting || !turnstileSiteKey || !turnstileToken}>
                            {isSubmitting ? "ENVIANDO.." : "ENVIAR CONSULTA"}
                            <span style={{ top: "147.172px", left: "108.5px" }}></span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default TestimonialForm;
