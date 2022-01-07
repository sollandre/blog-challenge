import { Children } from 'react';
import { IconContext, IconType } from 'react-icons';

import styles from './postinfo.module.scss';

interface PostInfo {
  icon: IconType;
  text: string;
}

export function PostInfo(props) {
  // console.log(props.children)
  return (
    <div className={styles.container}>
      <IconContext.Provider value={{color: "var(--grey-800)", size: "20px"}}>
      {props.icon}
      <p>{props.text}</p>
      </IconContext.Provider>
    </div>
  )
  
  // return (
  //   <div className={styles.container}>
  //     <IconContext.Provider value={{color: "var(--grey-800)", size: "20px"}}>
  //     {props.children}
  //     </IconContext.Provider>
  //   </div>
  // )
};