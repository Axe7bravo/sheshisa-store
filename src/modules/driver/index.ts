// src/modules/driver/index.ts

import { Module } from "@medusajs/framework/utils";
import DriverService from "./service"; // ✅ Import the class

export default Module("driver_entity", {
  service: DriverService,

});