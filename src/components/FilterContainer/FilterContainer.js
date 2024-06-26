import './FilterContainer.css'

function FilterContainer(props) {
  return (
    <div className={`filter_container ${props.className}`}>
      <p className={"filter_container_text"}>Сортировать по</p>
      {props.variants.map((variant, index) =>
        <div className={props.selected === variant ? "filter_container_variant_selected noselect" : "filter_container_variant noselect"}
             key={index} onClick={(e) => props.onChangeFunction(variant)}>
          {variant}
        </div>
      )}
    </div>
  )
}

FilterContainer.defaultProps = {
  className: ""
}

export default FilterContainer;