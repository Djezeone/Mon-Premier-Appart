
import React, { useState, useMemo } from 'react';
import { AdminTask, User, LetterTemplate } from '../types';
import { LETTER_TEMPLATES, DEFAULT_ADMIN_TASKS } from '../constants';
import { ArrowLeft, CheckCircle, Circle, FileText, Download, Printer, Calendar, AlertCircle, Clock, CalendarPlus, Pencil, CalendarDays } from 'lucide-react';

interface AdminPanelProps {
  tasks: AdminTask[];
  onToggleTask: (id: string) => void;
  updateTaskDate: (id: string, date: string) => void;
  user: User | null;
  goBack: () => void;
  movingDate: string;
  setMovingDate: (date: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ tasks, onToggleTask, updateTaskDate, user, goBack, movingDate, setMovingDate }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'letters'>('tasks');
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // Tasks with urgency logic
  const enrichedTasks = useMemo(() => {
      return tasks.map(task => {
          let deadline: Date | null = null;
          let daysLeft: number | null = null;
          let urgency: 'critical' | 'warning' | 'ok' | 'done' = 'ok';

          // 1. Manual Date Priority
          if (task.manualDate) {
              deadline = new Date(task.manualDate);
          } 
          // 2. Calculated Date Fallback
          else if (movingDate) {
              // Construct local date to avoid UTC shifts
              const moveDateObj = new Date(movingDate + 'T00:00:00');
              
              let offset = -30; // Default 1 month before
              if (task.category === 'energy') offset = -7;
              if (task.category === 'internet') offset = -14;
              if (task.category === 'housing') offset = -30; 
              
              deadline = new Date(moveDateObj);
              deadline.setDate(deadline.getDate() + offset);
          }

          if (deadline) {
              const now = new Date();
              daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              if (task.status === 'done') urgency = 'done';
              else if (daysLeft < 0) urgency = 'critical';
              else if (daysLeft < 7) urgency = 'warning';
          } else if (task.status === 'done') {
              urgency = 'done';
          }

          return { ...task, deadline, daysLeft, urgency };
      }).sort((a, b) => {
          if (a.status === 'done' && b.status !== 'done') return 1;
          if (a.status !== 'done' && b.status === 'done') return -1;
          if (a.daysLeft !== null && b.daysLeft !== null) return a.daysLeft - b.daysLeft;
          return 0;
      });
  }, [tasks, movingDate]);

  // Letter Generator Form State
  const [formData, setFormData] = useState({
      oldAddress: '10 rue de la Paix, 75000 Paris',
      newAddress: '25 avenue de la Liberté, 69000 Lyon',
      date: new Date().toLocaleDateString('fr-FR'),
      contractNum: '123456789'
  });

  const getGeneratedLetter = () => {
      if (!selectedTemplate) return '';
      let text = selectedTemplate.bodyModel;
      text = text.replace('{{name}}', user?.name || '[Votre Nom]');
      text = text.replace('{{old_address}}', formData.oldAddress);
      text = text.replace('{{new_address}}', formData.newAddress);
      text = text.replace('{{date}}', formData.date);
      text = text.replace('{{contract_num}}', formData.contractNum);
      return text;
  };

  const downloadFile = () => {
      const text = getGeneratedLetter();
      const element = document.createElement("a");
      const file = new Blob([text], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${selectedTemplate?.id}_document.txt`;
      document.body.appendChild(element);
      element.click();
  };

  const addToCalendar = (e: React.MouseEvent, taskName: string, deadline: Date) => {
      e.stopPropagation();
      
      const year = deadline.getFullYear();
      const month = String(deadline.getMonth() + 1).padStart(2, '0');
      const day = String(deadline.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;
      
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MonAppart//GoldEdition//FR
BEGIN:VEVENT
UID:${Date.now()}@monappart.app
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d\d\d/g,"")}
DTSTART;VALUE=DATE:${dateStr}
SUMMARY:Déménagement: ${taskName}
DESCRIPTION:Date limite pour : ${taskName}. N'oublie pas de le faire dans l'application Mon Premier Appart !
END:VEVENT
END:VCALENDAR`;

      const element = document.createElement("a");
      const file = new Blob([icsContent], {type: 'text/calendar'});
      element.href = URL.createObjectURL(file);
      element.download = `${taskName.replace(/\s/g, '_')}.ics`;
      document.body.appendChild(element);
      element.click();
  };

  const handleDateChange = (id: string, newDate: string) => {
      updateTaskDate(id, newDate);
      setEditingTaskId(null);
  };

  return (
    <div className="pb-24 min-h-full dark:text-gray-100">
      <div className="flex items-center gap-3 pt-4 mb-6">
        <button onClick={goBack} className="p-2 -ml-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Administratif 2.0</h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'tasks' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500'}`}
          >
              Timeline Démarches
          </button>
          <button 
            onClick={() => setActiveTab('letters')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'letters' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500'}`}
          >
              Générateur Lettres
          </button>
      </div>

      {activeTab === 'tasks' ? (
          <div className="space-y-6 animate-fade-in">
              {/* Date Input */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                  <div>
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Date du Déménagement</h3>
                      <p className="text-xs text-gray-400">Pour calculer tes échéances</p>
                  </div>
                  <div className="relative">
                      <input 
                        type="date" 
                        value={movingDate}
                        onChange={(e) => setMovingDate(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                      />
                  </div>
              </div>

              {!movingDate && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 p-3 rounded-lg text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      Entre une date pour activer la timeline intelligente.
                  </div>
              )}

              <div className="space-y-3">
                  {enrichedTasks.map(task => {
                      // Urgency visual logic
                      let borderClass = 'border-gray-100 dark:border-gray-700';
                      let bgClass = 'bg-white dark:bg-gray-800';
                      let iconColor = 'text-gray-300';

                      if (task.urgency === 'done') {
                          bgClass = 'bg-gray-50 dark:bg-gray-800 opacity-70';
                          iconColor = 'text-green-500';
                      } else if (task.urgency === 'critical') {
                          borderClass = 'border-red-200 dark:border-red-800';
                          bgClass = 'bg-red-50 dark:bg-red-900/10';
                      } else if (task.urgency === 'warning') {
                          borderClass = 'border-orange-200 dark:border-orange-800';
                          bgClass = 'bg-orange-50 dark:bg-orange-900/10';
                      }

                      return (
                          <div 
                            key={task.id} 
                            className={`p-4 rounded-xl border ${borderClass} ${bgClass} shadow-sm transition-all group relative`}
                          >
                              <div className="flex items-start gap-3">
                                  <div className="pt-0.5 cursor-pointer" onClick={() => onToggleTask(task.id)}>
                                    {task.status === 'done' ? (
                                        <CheckCircle className={`w-5 h-5 ${iconColor}`} />
                                    ) : (
                                        <Circle className={`w-5 h-5 ${iconColor}`} />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                      <div className={`font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-white'}`}>
                                          {task.label}
                                      </div>
                                      
                                      {(task.deadline || movingDate) && task.status !== 'done' && (
                                          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                                              <div className="flex items-center gap-2">
                                                  {/* Calculated Days Left Badge */}
                                                  {task.daysLeft !== null && (
                                                      <div className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                                          task.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                                                          task.urgency === 'warning' ? 'bg-orange-100 text-orange-700' :
                                                          'bg-green-100 text-green-700'
                                                      }`}>
                                                          <Clock size={10} />
                                                          {task.daysLeft < 0 
                                                            ? `Retard de ${Math.abs(task.daysLeft)}j` 
                                                            : `J-${task.daysLeft}`
                                                          }
                                                      </div>
                                                  )}
                                                  
                                                  {/* Deadline Date Display / Edit */}
                                                  <div className="flex items-center gap-1 text-xs text-gray-400 group/date">
                                                      {editingTaskId === task.id ? (
                                                          <input 
                                                              type="date" 
                                                              autoFocus
                                                              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 text-xs text-gray-900 dark:text-white"
                                                              value={task.manualDate || (task.deadline ? task.deadline.toISOString().split('T')[0] : '')}
                                                              onChange={(e) => handleDateChange(task.id, e.target.value)}
                                                              onBlur={() => setEditingTaskId(null)}
                                                          />
                                                      ) : (
                                                          <>
                                                              <span>
                                                                  {task.manualDate ? 'Date fixée le ' : 'Avant le '} 
                                                                  {task.deadline?.toLocaleDateString()}
                                                              </span>
                                                              <button 
                                                                onClick={(e) => { e.stopPropagation(); setEditingTaskId(task.id); }}
                                                                className="opacity-0 group-hover/date:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-indigo-500 transition-all"
                                                                title="Modifier la date"
                                                              >
                                                                  <Pencil size={10} />
                                                              </button>
                                                          </>
                                                      )}
                                                  </div>
                                              </div>

                                              {/* Actions */}
                                              <div className="flex items-center gap-1">
                                                  {/* Manual Date Trigger (if not already manual) */}
                                                  {!task.manualDate && !editingTaskId && (
                                                      <button 
                                                        onClick={() => setEditingTaskId(task.id)}
                                                        className="bg-gray-50 dark:bg-gray-800 text-gray-400 p-1.5 rounded-lg hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                                        title="Définir une date manuelle"
                                                      >
                                                          <CalendarDays size={16} />
                                                      </button>
                                                  )}
                                                  {/* Add to Calendar Button */}
                                                  {task.deadline && (
                                                      <button 
                                                        onClick={(e) => addToCalendar(e, task.label, task.deadline!)}
                                                        className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                                                        title="Ajouter au calendrier"
                                                      >
                                                          <CalendarPlus size={16} />
                                                      </button>
                                                  )}
                                              </div>
                                          </div>
                                      )}
                                      {!movingDate && !task.manualDate && (
                                          <div className="flex justify-between items-center mt-1">
                                              <div className="text-xs text-gray-400">Catégorie : {task.category}</div>
                                              <button 
                                                onClick={() => setEditingTaskId(task.id)}
                                                className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
                                              >
                                                  <CalendarDays size={12} /> Définir date
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      ) : (
          <div className="space-y-6 animate-fade-in">
              {/* Template Selection */}
              <div className="grid grid-cols-1 gap-2">
                  {LETTER_TEMPLATES.map(template => (
                      <button 
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                            selectedTemplate?.id === template.id 
                            ? 'bg-white dark:bg-gray-700 border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                        }`}
                      >
                          <div className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                              <FileText size={16} className="text-indigo-500" />
                              {template.label}
                          </div>
                      </button>
                  ))}
              </div>

              {selectedTemplate && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 animate-slide-up">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                          <Printer className="text-indigo-500" size={20} />
                          Personnalisation
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ancienne Adresse</label>
                              <input 
                                type="text" 
                                value={formData.oldAddress}
                                onChange={e => setFormData({...formData, oldAddress: e.target.value})}
                                className="w-full p-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm dark:text-white dark:border-gray-600 text-gray-900"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nouvelle Adresse</label>
                              <input 
                                type="text" 
                                value={formData.newAddress}
                                onChange={e => setFormData({...formData, newAddress: e.target.value})}
                                className="w-full p-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm dark:text-white dark:border-gray-600 text-gray-900"
                              />
                          </div>
                          <div className="flex gap-2">
                              <div className="flex-1">
                                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
                                  <input 
                                    type="text" 
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm dark:text-white dark:border-gray-600 text-gray-900"
                                  />
                              </div>
                              <div className="flex-1">
                                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">N° Contrat</label>
                                  <input 
                                    type="text" 
                                    value={formData.contractNum}
                                    onChange={e => setFormData({...formData, contractNum: e.target.value})}
                                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm dark:text-white dark:border-gray-600 text-gray-900"
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Realistic Paper Preview */}
                      <div className="bg-white text-black p-8 rounded-sm shadow-xl border border-gray-200 text-xs font-serif leading-relaxed mb-4 min-h-[300px] relative">
                          <div className="absolute top-0 right-0 w-12 h-12 bg-gray-50 border-b border-l transform -rotate-2"></div>
                          <p className="mb-4">{user?.name}<br/>{formData.oldAddress}</p>
                          <p className="text-right mb-8">Fait à Paris, le {formData.date}</p>
                          <p className="font-bold mb-4">Objet : {selectedTemplate.subject}</p>
                          <p className="whitespace-pre-wrap">{getGeneratedLetter()}</p>
                      </div>

                      <div className="flex gap-3">
                          <button 
                            onClick={downloadFile}
                            className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                          >
                              <Download size={18} /> Télécharger (.txt)
                          </button>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default AdminPanel;
