import React, { useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

export function DatePicker({ value, onChange, placeholder = "Seleccionar fecha..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || "");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const triggerRef = React.useRef(null);
  const [triggerRect, setTriggerRect] = React.useState(null);

  // Sincronizar el valor externo con el estado interno
  React.useEffect(() => {
    setSelectedDate(value || "");
  }, [value]);

  // Actualizar la posición del trigger cuando se abre
  React.useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerRect(rect);
    }
  }, [isOpen]);

  // Manejar click outside y escape
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.date-picker-content')) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleDateChange = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    onChange?.(dateString);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = startDate - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    // Días del siguiente mes para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <>
      <div className="relative date-picker-container" ref={triggerRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 text-foreground rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 shadow-sm transition placeholder-gray-400 dark:placeholder-gray-500 flex items-center justify-between cursor-pointer ${
            isOpen ? 'ring-2 ring-indigo-400 border-indigo-400' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className={selectedDate ? "text-foreground" : "text-gray-400 dark:text-gray-500"}>
              {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isOpen && triggerRect && typeof document !== 'undefined' && createPortal(
        <DatePickerContent
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          triggerRect={triggerRect}
          monthNames={monthNames}
          dayNames={dayNames}
          getDaysInMonth={getDaysInMonth}
          navigateMonth={navigateMonth}
        />,
        document.body
      )}
    </>
  );
}

function DatePickerContent({ 
  currentMonth, 
  selectedDate, 
  onDateChange, 
  triggerRect, 
  monthNames, 
  dayNames, 
  getDaysInMonth, 
  navigateMonth 
}) {
  const style = {
    position: 'fixed',
    top: triggerRect.bottom + window.scrollY + 4,
    left: triggerRect.left + window.scrollX,
    minWidth: 320,
    zIndex: 99999,
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;

  return (
    <div 
      className="date-picker-content bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4"
      style={style}
    >
          {/* Header del calendario */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="font-semibold text-foreground">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map(({ date, isCurrentMonth }, index) => {
              const isSelected = selectedDate === date.toISOString().split('T')[0];
              const isToday = new Date().toDateString() === date.toDateString();
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateChange(date)}
                  className={`
                    h-8 w-8 rounded-lg text-sm transition-colors
                    ${!isCurrentMonth 
                      ? 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700' 
                      : 'text-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${isSelected 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : ''
                    }
                    ${isToday && !isSelected 
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                      : ''
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => {
                setSelectedDate("");
                onChange?.("");
                setIsOpen(false);
              }}
              className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => {
                handleDateChange(new Date());
              }}
              className="flex-1 px-3 py-2 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
      
      {/* Overlay para cerrar cuando se hace click fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[55]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Para compatibilidad con años simples también
export function YearPicker({ value, onChange, placeholder = "Año..." }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm transition placeholder-gray-400 dark:placeholder-gray-500"
    >
      <option value="">{placeholder}</option>
      {years.map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  );
}
