import { FiCalendar } from 'react-icons/fi'
import { FiUser } from 'react-icons/fi'

import { PostInfo } from "../PostInfo";

import styles from './preview.module.scss'

export function PostPreview () {
  return (
    <>
      <div className={styles.container}>
        <a href="#" className={styles.title}>Post Preview Title</a>
        <p className={styles.subtitle}>Post preview text</p>
        <div className={styles.informationContainer}>
          <PostInfo
            icon={<FiCalendar />}
            text='12/12/2021'
            />
          <PostInfo
          icon={<FiUser />}
          text='Andre Solla'
          />
        </div>
      </div>

      <div className={styles.container}>
        <a href="#" className={styles.title}>Post Preview Title</a>
        <p className={styles.subtitle}>Post preview text</p>
        <div className={styles.informationContainer}>
          <PostInfo
            icon={<FiCalendar />}
            text='12/12/2021'
            />
          <PostInfo
          icon={<FiUser />}
          text='Andre Solla'
          />
        </div>
      </div>

      <div className={styles.container}>
        <a href="#" className={styles.title}>Post Preview Title</a>
        <p className={styles.subtitle}>Post preview text</p>
        <div className={styles.informationContainer}>
          <PostInfo
            icon={<FiCalendar />}
            text='12/12/2021'
            />
          <PostInfo
          icon={<FiUser />}
          text='Andre Solla'
          />
        </div>
      </div>
    </>
  )
}