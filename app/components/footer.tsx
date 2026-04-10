import Link from "next/link"
import { FadeInView } from "./FadeInView"
import { Container } from "@/components/ui/container"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8 text-card-foreground">
      <Container size="default" className="text-center">
        <FadeInView>
          <div className="mb-2 text-sm">
            <Link
              href="/privacy-policy"
              className="font-medium text-muted-foreground transition-colors duration-300 hover:text-[#1586D6]"
            >
              Privacy Policy
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RUSH. All rights reserved.
            Developed by{" "}
            <a
              className="text-foreground duration-500 hover:text-[#1586D6]"
              href="https://tonekingdev.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tone King Development
            </a>
          </p>
        </FadeInView>
      </Container>
    </footer>
  )
}
