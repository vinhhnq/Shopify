class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant || !this.currentVariant?.featured_media) return;
    const newMedia = document.querySelector(
      `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
    );
    if (!newMedia) return;
    const parent = newMedia.parentElement;
    //parent.prepend(newMedia);
    const itemact = document.querySelectorAll('.FeaturedImage_slick .item');
    for (var i = 0; i < itemact.length; i++) {
      itemact[i].classList.remove('act')
    }
    newMedia.classList.add('act');
    window.setTimeout(() => { parent.scroll(0, 0) });
  }

  updateURL() {
    if (!this.currentVariant) return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant?.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const id = `ProductPrice-${this.dataset.section}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id);
        const source = html.getElementById(id);

        if (source && destination) destination.innerHTML = source.innerHTML;

        document.getElementById(`price-${this.dataset.section}`)?.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.notify_me);
        const variant_id = document.getElementById("variant_id").getAttribute('value');
        const sku = document.getElementById("productSelect").querySelector('[value="'+variant_id+'"]').getAttribute('data-sku');
        const variantSku = document.getElementById('variantSku');
        if (typeof variantSku !== 'undefined' && variantSku) {
          variantSku.innerHTML = sku;
        }
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const addButton = document.getElementById(`product-form-${this.dataset.section}`)?.querySelector('[name="add"]');
	  const addButton2 = document.getElementById(`product-form-${this.dataset.section}`)?.querySelector('[name="add2"]');
    const addButton3 = document.getElementById(`product-form-${this.dataset.section}`)?.querySelector('.product-form__item--checkout');
    
    if (!addButton) return;
    if (disable) {
      addButton.setAttribute('disabled', true);
      addButton.parentElement.style.display = 'none';
      addButton2.style.display = 'block';
      if (text) addButton2.querySelector('#txt-notify').textContent = text;
      if (!addButton3) return;
      addButton3.setAttribute('disabled', true);
    } else {
      addButton.removeAttribute('disabled');
      addButton2.style.display = 'none';
	    addButton.parentElement.style.display = 'block';
      const variant_id = document.getElementById("variant_id").getAttribute('value');
      const qty_var = document.getElementById("productSelect").querySelector('[value="'+variant_id+'"]').getAttribute('data-qty');
      if(qty_var < 1) {
        addButton.querySelector('#AddToCartText').textContent = window.variantStrings.preorder;
      } else {
        addButton.querySelector('#AddToCartText').textContent = window.variantStrings.addToCart;
      }
      if (!addButton3) return;
      addButton3.removeAttribute('disabled');
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const addButton = document.getElementById(`product-form-${this.dataset.section}`)?.querySelector('[name="add"]');
    if (!addButton) return;
    addButton.textContent = window.variantStrings.unavailable;
    document.getElementById(`ProductPrice-${this.dataset.section}`)?.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);
