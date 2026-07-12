import { useEffect, useState } from "react";

import { getDepartments } from "@/services/departmentService";
import { getCategories } from "@/services/categoryService";
import { getEmployees } from "@/services/employeeService";

import DepartmentDialog from "@/components/organization/departments/DepartmentDialog";
import CategoryDialog from "@/components/organization/categories/CategoryDialog";

import { Plus } from "lucide-react";

import DepartmentsTab from "./DepartmentsTab";
import CategoriesTab from "./CategoriesTab";
import EmployeesTab from "./EmployeesTab";

function OrganizationSetup() {
  const [activeTab, setActiveTab] = useState("departments");

  // Department state
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Category state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Employee state
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  async function fetchDepartments() {
    try {
      setLoadingDepartments(true);
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDepartments(false);
    }
  }

  async function fetchCategories() {
    try {
      setLoadingCategories(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function fetchEmployees() {
    try {
      setLoadingEmployees(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingEmployees(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
    fetchCategories();
    fetchEmployees();
  }, []);

  function handleAddClick() {
    if (activeTab === "departments") {
      setDepartmentDialogOpen(true);
    } else if (activeTab === "categories") {
      setCategoryDialogOpen(true);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Organization Setup</h1>
          <p className="font-sans text-sm text-ink/50 mt-0.5">
            Manage departments, asset categories and employees.
          </p>
        </div>

        {activeTab !== "employees" && (
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-sans bg-ink text-paper rounded-md transition-colors duration-150 hover:bg-ink/90"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-line flex gap-6">
        {["departments", "categories", "employees"].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-sm font-sans font-medium transition-colors duration-150 relative capitalize
                ${isActive ? "text-ink font-semibold" : "text-ink/50 hover:text-ink/80"}
              `}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === "departments" && (
          <DepartmentsTab
            departments={departments}
            loading={loadingDepartments}
            refreshDepartments={fetchDepartments}
          />
        )}

        {activeTab === "categories" && (
          <CategoriesTab
            categories={categories}
            loading={loadingCategories}
            refreshCategories={fetchCategories}
          />
        )}

        {activeTab === "employees" && (
          <EmployeesTab
            employees={employees}
            loading={loadingEmployees}
            refreshEmployees={fetchEmployees}
          />
        )}
      </div>

      <DepartmentDialog
        open={departmentDialogOpen}
        onOpenChange={setDepartmentDialogOpen}
        onSuccess={fetchDepartments}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSuccess={fetchCategories}
      />
    </div>
  );
}

export default OrganizationSetup;