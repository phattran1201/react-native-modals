import Modal from './Modal';
import ModalPortal from './ModalPortal';

class BottomModal extends Modal {
  show() {
    const { children, ...options } = this.props;
    this.id = ModalPortal.show(children, { ...options, type: 'bottomModal' });
  }
}

export default BottomModal;
