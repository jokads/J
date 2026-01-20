import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface AutomationManagementProps {
  darkMode: boolean;
}

export default function AutomationManagement({ darkMode }: AutomationManagementProps) {
  const [rules, setRules] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    try {
      const [rulesRes, templatesRes, tasksRes] = await Promise.all([
        supabase.from('automation_rules').select('*').order('created_at', { ascending: false }),
        supabase.from('email_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('scheduled_tasks').select('*').order('created_at', { ascending: false })
      ]);

      setRules(rulesRes.data || []);
      setTemplates(templatesRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar automações:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-flashlight-line text-yellow-500"></i>
            Gestão de Automação
          </h2>
          <p className="text-gray-400 mt-1">Automatize processos e regras de negócio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Regras de Automação</h3>
            <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
              <i className="ri-add-line text-xl"></i>
              Nova Regra
            </button>
          </div>

          <div className="space-y-3">
            {rules.length === 0 ? (
              <div className="text-center py-8">
                <i className="ri-robot-line text-6xl text-gray-600 mb-4"></i>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  Nenhuma regra de automação criada
                </p>
                <button className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                  Criar Primeira Regra
                </button>
              </div>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {rule.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ml-2 whitespace-nowrap ${
                      rule.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {rule.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Executada {rule.execution_count || 0} vezes
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                        <i className="ri-edit-line"></i>
                      </button>
                      <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Templates de E-mail</h3>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
              <i className="ri-add-line text-xl"></i>
              Novo Template
            </button>
          </div>

          <div className="space-y-3">
            {templates.length === 0 ? (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhum template criado</p>
            ) : (
              templates.map((template) => (
                <div key={template.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {template.subject}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {template.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                      <i className="ri-edit-line"></i>
                    </button>
                    <button className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors">
                      <i className="ri-eye-line"></i>
                    </button>
                    <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Tarefas Agendadas</h3>
          <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <i className="ri-add-line text-xl"></i>
            Nova Tarefa
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.length === 0 ? (
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhuma tarefa agendada</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{task.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {task.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="ri-time-line text-gray-400"></i>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {task.schedule_cron}
                    </span>
                  </div>
                  {task.last_run && (
                    <div className="flex items-center gap-2">
                      <i className="ri-check-line text-green-500"></i>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Última execução: {new Date(task.last_run).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
