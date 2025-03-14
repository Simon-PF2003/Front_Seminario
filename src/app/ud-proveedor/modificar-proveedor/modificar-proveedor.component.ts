import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SupplierService } from 'src/app/services/supplier.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modificar-proveedor',
  templateUrl: './modificar-proveedor.component.html',
  styleUrls: ['./modificar-proveedor.component.css']
})
export class ModificarProveedorComponent {
  @Input() 
  editedSupplier: any;


  constructor(
    public activeModal: NgbActiveModal,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {

  }

  saveChanges() {
    this.supplierService.updateDetails(this.editedSupplier._id, this.editedSupplier).subscribe(
      {
        next: res => {
          Swal.fire('Proveedor actualizado con éxito!!', '', 'success');
        },
        error: err => {
          Swal.fire('Error', 'Error al actualizar el proveedor', 'error');
          
        }
      }
    );
  }

  close() {
    this.activeModal.close();
    location.reload();
  }
}


