const { findActivos } = require("../src/bloqueos/bloqueos.model");

// ── Utilidades de tiempo ──────────────────────────────────────────────────────

/**
 * Convierte "HH:MM" o "HH:MM:SS" a minutos desde medianoche.
 */
function toMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Convierte minutos desde medianoche a string "HH:MM".
 */
function fromMinutos(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, "0");
  const m = String(minutos % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// ── Generación de slots ───────────────────────────────────────────────────────

/**
 * Genera los slots de tiempo del día entre hora_apertura y hora_cierre
 * con intervalos de duracionSlot minutos.
 * Un slot solo se incluye si el servicio cabe completo antes del cierre.
 *
 * Ejemplo: apertura=09:00, cierre=18:00, slotMin=60, durServicio=90
 * → último slot válido es 16:30 (termina a las 18:00)
 */
function generarSlots(horaApertura, horaCierre, duracionSlot, duracionServicio) {
  const slots  = [];
  const inicio = toMinutos(horaApertura);
  const fin    = toMinutos(horaCierre);

  for (let min = inicio; min + duracionServicio <= fin; min += duracionSlot) {
    slots.push(fromMinutos(min));
  }

  return slots;
}

// ── Lógica de bloqueos ────────────────────────────────────────────────────────

/**
 * Determina si un slot queda bloqueado por algún bloqueo activo.
 *
 * @param {string} hora          - "HH:MM"
 * @param {string} fecha         - "YYYY-MM-DD"
 * @param {number} duracionServ  - minutos que dura el servicio
 * @param {Array}  bloqueos      - array de bloqueos activos de la BD
 * @returns {boolean}
 */
function estaBloqueado(hora, fecha, duracionServ, bloqueos) {
  // día de la semana (0=Dom … 6=Sáb) calculado en UTC para evitar offset
  const [y, mo, d] = fecha.split("-").map(Number);
  const diaSemana  = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();

  const slotInicio = toMinutos(hora);
  const slotFin    = slotInicio + duracionServ;

  return bloqueos.some((b) => {
    if (!b.activo) return false;

    if (b.tipo === "dia") {
      // Bloqueo de fecha específica
      if (b.fecha) {
        const fechaBloq = String(b.fecha).split("T")[0]; // normalizar si viene como datetime
        return fechaBloq === fecha;
      }
      // Bloqueo semanal recurrente
      if (b.dia_semana !== null && b.dia_semana !== undefined) {
        return Number(b.dia_semana) === diaSemana;
      }
    }

    if (b.tipo === "horario" && b.hora_inicio && b.hora_fin) {
      // Bloqueo de rango horario: el slot se bloquea si se solapa con el rango
      const bloqInicio = toMinutos(b.hora_inicio);
      const bloqFin    = toMinutos(b.hora_fin);
      return slotInicio < bloqFin && slotFin > bloqInicio;
    }

    return false;
  });
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Calcula los slots disponibles para una fecha y servicio dados.
 *
 * @param {string} fecha         - "YYYY-MM-DD"
 * @param {Object} servicio      - { duracion_min }
 * @param {Object} config        - { hora_apertura, hora_cierre, duracion_slot_min }
 * @param {Array}  citasDelDia   - citas activas del día (estado != 'cancelada'), con campo 'hora'
 * @returns {Promise<Array>}     - [{ hora: "HH:MM", disponible: boolean }]
 */
async function calcularDisponibilidad(fecha, servicio, config, citasDelDia) {
  const duracionSlot = Number(config.duracion_slot_min);
  const duracionServ = Number(servicio.duracion_min);

  const slots   = generarSlots(config.hora_apertura, config.hora_cierre, duracionSlot, duracionServ);
  const bloqueos = await findActivos();

  // Citas existentes expresadas en minutos para cálculo de solapamiento
  const citasMin = citasDelDia.map((c) => ({
    inicio: toMinutos(String(c.hora).substring(0, 5)),
    fin:    toMinutos(String(c.hora).substring(0, 5)) + duracionSlot,
  }));

  return slots.map((hora) => {
    // 1. ¿Está bloqueado por la tabla bloqueos?
    if (estaBloqueado(hora, fecha, duracionServ, bloqueos)) {
      return { hora, disponible: false };
    }

    // 2. ¿Se solapa con alguna cita existente?
    const slotInicio = toMinutos(hora);
    const slotFin    = slotInicio + duracionServ;

    const solapaCita = citasMin.some(
      ({ inicio, fin }) => slotInicio < fin && slotFin > inicio
    );

    return { hora, disponible: !solapaCita };
  });
}

module.exports = { calcularDisponibilidad };
