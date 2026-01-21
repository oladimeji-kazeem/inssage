import React from 'react';
import { Card } from '../ui/Card';
import { ArrowRight, Database, Monitor, Server } from 'lucide-react';

export const DataLineage: React.FC = () => {
    // Mock Lineage visualization since we don't have a graph library installed yet
    // In a real app, use ReactFlow

    return (
        <Card className="h-[600px] relative bg-gray-50 overflow-hidden">
            <h3 className="absolute top-4 left-4 text-lg font-bold z-10">Data Lineage Explorer</h3>

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-8">
                    {/* Source */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 bg-white rounded-full border-2 border-blue-200 shadow-sm flex items-center justify-center">
                            <Server size={32} className="text-blue-600" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-sm">Postgres DB</div>
                            <div className="text-xs text-gray-500">Source System</div>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border">Fivetran Sync</div>
                        <div className="w-32 h-0.5 bg-gray-300 relative">
                            <ArrowRight className="absolute -right-3 -top-2.5 text-gray-300" />
                        </div>
                    </div>

                    {/* Warehouse */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-28 h-28 bg-white rounded-xl border-2 border-purple-200 shadow-sm flex items-center justify-center relative">
                            <Database size={40} className="text-purple-600" />
                            <span className="absolute top-2 right-2 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-sm">Snowflake DW</div>
                            <div className="text-xs text-gray-500">Raw Layer</div>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border">dbt Transform</div>
                        <div className="w-32 h-0.5 bg-gray-300 relative">
                            <ArrowRight className="absolute -right-3 -top-2.5 text-gray-300" />
                        </div>
                    </div>

                    {/* Mart */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 bg-white rounded-lg border-2 border-orange-200 shadow-sm flex items-center justify-center">
                            <Database size={32} className="text-orange-600" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-sm">Finance Mart</div>
                            <div className="text-xs text-gray-500">Gold Layer</div>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border">Tableau Extract</div>
                        <div className="w-32 h-0.5 bg-gray-300 relative">
                            <ArrowRight className="absolute -right-3 -top-2.5 text-gray-300" />
                        </div>
                    </div>

                    {/* Consumption */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 bg-white rounded-lg border-2 border-green-200 shadow-sm flex items-center justify-center">
                            <Monitor size={32} className="text-green-600" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-sm">Revenue Dashboard</div>
                            <div className="text-xs text-gray-500">BI Report</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow border text-xs">
                <div className="font-semibold mb-2">Legend</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded-full"></div> Source</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-purple-100 border border-purple-400 rounded-sm"></div> Storage</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-100 border border-green-400 rounded-sm"></div> Consumption</div>
            </div>
        </Card>
    );
};
