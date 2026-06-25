import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GeneaLogoWhite } from './BrandTheme';

const tierColors = {
  'Tier 1': 'bg-red-100 text-red-700',
  'Tier 2': 'bg-blue-100 text-blue-700',
  'Tier 3': 'bg-green-100 text-green-700',
  'Tier 4': 'bg-gray-100 text-gray-600',
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectsDashboard({ onNew, onOpen }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, tier, release_date, updated_at, release_data')
      .order('updated_at', { ascending: false });
    if (error) {
      setError('Could not load projects. Check your Supabase connection.');
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm('Delete this project?')) return;
    setDeleting(id);
    await supabase.from('projects').delete().eq('id', id);
    setProjects(p => p.filter(proj => proj.id !== id));
    setDeleting(null);
  }

  const hasContent = p => p.release_data?.generatedProductBrief || p.release_data?.generatedMarketingPlaybook;

  return (
    <div className="min-h-screen bg-gradient-to-br from-genea-navy via-genea-blue to-genea-bright flex flex-col">
      {/* Header */}
      <div className="max-w-5xl mx-auto w-full px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-2">
          <GeneaLogoWhite size="lg" />
          <button
            onClick={onNew}
            className="flex items-center gap-2 bg-white text-genea-navy font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>
        <p className="text-blue-200 text-sm mt-4">Release Document Builder</p>
      </div>

      {/* Projects list */}
      <div className="flex-1 bg-gray-50 rounded-t-3xl">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-genea-navy mb-5">Your Projects</h2>

          {loading && (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading projects...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">{error}</div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <div className="w-14 h-14 bg-genea-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-genea-bright" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-700 text-lg mb-2">No projects yet</h3>
              <p className="text-gray-400 text-sm mb-6">Create your first release project to get started.</p>
              <button
                onClick={onNew}
                className="bg-genea-navy text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-genea-blue transition-colors"
              >
                New Project
              </button>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="space-y-3">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => onOpen(project)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-genea-bright/30 transition-all cursor-pointer group px-6 py-5 flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-genea-light rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-genea-bright/10 transition-colors">
                    <svg className="w-5 h-5 text-genea-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-genea-navy truncate">{project.name}</h3>
                      {project.tier && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${tierColors[project.tier] || tierColors['Tier 4']}`}>
                          {project.tier}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {project.release_date && <span>Release: {project.release_date}</span>}
                      <span>Updated {formatDate(project.updated_at)}</span>
                      {hasContent(project) && (
                        <span className="text-genea-bright font-semibold">Documents ready</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={e => handleDelete(e, project.id)}
                      disabled={deleting === project.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-genea-bright transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
