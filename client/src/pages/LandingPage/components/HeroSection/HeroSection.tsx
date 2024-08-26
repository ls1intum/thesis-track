import { Title, Text, Button, Container } from '@mantine/core'
import * as classes from './HeroSection.module.css'
import { HeroDots } from '../HeroDots/HeroDots'
import { Link } from 'react-router-dom'

export function HeroSection() {
  return (
    <Container className={classes.wrapper} size={1400}>
      <HeroDots className={classes.dots} style={{ left: 0, top: 10 }} />
      <HeroDots className={classes.dots} style={{ left: 60, top: 10 }} />
      <HeroDots className={classes.dots} style={{ left: 0, top: 150 }} />
      <HeroDots className={classes.dots} style={{ right: 0, top: 70 }} />

      <div className={classes.inner}>
        <Title className={classes.title}>
          Find or Propose the{' '}
          <Text component='span' className={classes.highlight} inherit>
            Perfect Thesis
          </Text>{' '}
          Topic
        </Title>

        <Container p={0} size={700}>
          <Text size='lg' c='dimmed' className={classes.description}>
            Whether you&apos;re looking for inspiration or have a unique idea in mind, Thesis Track
            makes it easy. Explore topics posted by instructors or suggest your own.
          </Text>
        </Container>

        <div className={classes.controls}>
          <Button
            component={Link}
            to='/dashboard'
            className={classes.control}
            size='lg'
            variant='default'
            color='gray'
          >
            Login
          </Button>
          <Button component={Link} to='/submit-application' className={classes.control} size='lg'>
            Apply Now
          </Button>
        </div>
      </div>
    </Container>
  )
}

export default HeroSection
