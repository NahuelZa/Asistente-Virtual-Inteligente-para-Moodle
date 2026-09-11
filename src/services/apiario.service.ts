import { FirestoreService } from "./FirestoreService";
import type { Apiario } from "../models/apiario.model";
import { COLLECTIONS } from "../constants";

export class ApiarioService extends FirestoreService<Apiario> {
  constructor() {
    super(COLLECTIONS.APIARIOS);
  }
}

export const apiarioService = new ApiarioService();
