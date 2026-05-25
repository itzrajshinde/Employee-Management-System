import { Router } from "express"
import { protect, protectAdmin } from "../middleware/auth.js"
import {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
} from "../controllers/employeeController.js"

const employeesRouter = Router()

employeesRouter.get("/", protect, protectAdmin, getEmployees)
employeesRouter.post("/", protect, protectAdmin, createEmployee)
employeesRouter.put("/:id", protect, protectAdmin, updateEmployee)
employeesRouter.delete("/:id", protect, protectAdmin, deleteEmployee)

export default employeesRouter
